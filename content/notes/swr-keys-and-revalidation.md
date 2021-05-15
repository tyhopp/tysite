<!--
title: SWR keys and revalidation
slug: /notes/swr-keys-and-revalidation
date: 2021-05-09
description: A solution to managing keys and revalidation for the SWR library.
categories: JS, TS
-->

# SWR keys and revalidation

Over the last half year I've worked with [SWR](https://swr.vercel.app), a "React Hooks library for data fetching" by the same group of people behind [Next.js](https://nextjs.org) and [Vercel](https://vercel.com). It's a neat library that I like specifically for it's link to an actual RFC, [RFC 5861](https://tools.ietf.org/html/rfc5861):

> The stale-while-revalidate HTTP Cache-Control extension allows a cache to immediately return a stale response while it revalidates it in the background, thereby hiding latency (both in the network and on the server) from clients.

A basic use case for using SWR in a component might look like this (much less basic than the one from the docs, though):

```tsx
import useSWR from 'swr';
import { fetcher } from '../lib/swr/fetch';
import { getLovelyNameByIdQuery } from '../shared/lovely/queries/getLovelyNameByIdQuery';

export function LovelyNameComponent(lovelyId: string): JSX.Element {
  const { data: lovelyName, error: lovelyError } = useSWR(
    // If the first argument to useSWR is null, the fetch will not run.
    // Here, we require a lovelyId before telling SWR to fire off our request.
    lovelyId ? `lovely-name-${lovelyId}` : null,
    () => {
      fetcher({
        query: getLovelyNameByIdQuery.loc.source.body,
        variables: {
          id: lovelyId,
        },
      });
    }
  );

  if (lovelyError) {
    return <div>Oops, something went wrong.</div>;
  }

  // We only want to show our loading indicator on first load in this case
  if (typeof lovelyName !== 'undefined') {
    return <div>Loading...</div>;
  }

  return <div>{lovelyName}</div>;
}
```

A couple things to clarify to avoid confusion:

- `fetcher` is a wrapper around [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) that we use for client-side requests, we'll ignore this.
- `getLovelyNameByIdQuery` is a generic GraphQL query wrapped with [graphql-tag](https://github.com/apollographql/graphql-tag), we'll also ignore this.

The key point I want to discuss in this note is the way we define keys to use in our SWR cache:

```javascript
lovelyId ? `lovely-name-${lovelyId}` : null,
```

This understated line is arguably the most important. To understand why, we have to introduce one other concept from the SWR library: **revalidation**.

### Revalidation

Revalidation is the process of checking whether the data displayed in our client (and stored in our cache) needs to update to match what is stored in our database. Aside from the special cases where the SWR library will revalidate for us, namely on window focus (`revalidateOnFocus`) and when a network connection is dropped and regained (`revalidateOnReconnect`), there are two ways we can tell SWR to revalidate our data.

### Bound mutate

The bound `mutate` function is returned from the `useSWR` hook wherever you implement it. In our `LovelyNameComponent`, that would look like this:

```tsx
export function LovelyNameComponent(lovelyId: string): JSX.Element {
  // Access and rename the bound mutate function
  const { data: lovelyName, error: lovelyError, mutate: refreshLovelyName } = useSWR(
    lovelyId ? `lovely-name-${lovelyId}` : null,
    () => {
      fetcher({
        query: getLovelyNameByIdQuery.loc.source.body,
        variables: {
          id: lovelyId,
        },
      });
    }
  );

  ...

  // We can pass this refresh function around to other components or use it somewhere else like this:
	return (
	  <button
      onClick={() => {
        refreshLovelyName();
      }}
    >
      Click me, user!
    </button>
  )
```

This is great if we want to be able to revalidate in this component or another component that is nearby in the DOM, but not practical if we want to revalidate from some other faraway part of our app. Enter the second option to revalidate: the global `mutate`:

### Global mutate

[SWR's docs](https://swr.vercel.app/docs/mutation) say this about the global mutate function:

> You can broadcast a revalidation message globally to all SWRs with the same key by calling `mutate(key)`.

Continuing our scenario, that would look like this:

```tsx
import { mutate } from 'swr';

export function SomeOtherComponent(lovelyId: string): JSX.Element {
  return (
    <button
      onClick={() => {
        mutate(`lovely-name-${lovelyId}`);
      }}
    >
      Click me to revalidate the lovely name component
    </button>
  );
}
```

This is a great solution to avoid passing around too many bound `mutate` functions, but it requires us to know two things to make it work:

- The SWR cache key name used in `LovelyNameComponent`
- The value of the parameter interpolated in the cache key name (`lovelyId`)

While not a problem in small apps, medium to large apps with hundreds or thousands of different requests present a challenge.

### Introducing an SWR key registry

A good solution to this challenge should help achieve the following:

- Avoid unnecessary duplication of requests
- Leverage the cache in all places where the cache can be leveraged
- Easily revalidate requests via the global mutate function
- Reduce bugs that occur when we change SWR keys

To do this, we introduced the concept of an SWR registry via a [TypeScript string enum](https://www.typescriptlang.org/docs/handbook/enums.html#string-enums):

```typescript
export enum SWRCacheKey {
  lovelyName = 'lovelyName',
}
```

We then use the registry like this:

```typescript
lovelyId ? `${SWRCacheKey.lovelyName}-${lovelyId}` : null,
```

However, only solves half the problem. We also need to know the parameters interpolated with the key!

### Exporting key getters

Instead of exporting and using the `SWRCacheKey` enum directly, we can export getters that allow us to define a signature for interpolated parameters and associate it with the cache key.

```typescript
export const SWRCacheKeyGetters = {
  lovelyName: (lovelyId: string) => {
    return `${SWRCacheKey.lovelyName}-${lovelyId}`;
  },
};
```

We would then use it like this:

```typescript
lovelyId ? SWRCacheKeyGetters.lovelyName(lovelyId) : null,
```

And if we're using a decent text editor like [VSCode](https://code.visualstudio.com), the editor will show us what a list of possible getters and the associated signature for each via [IntelliSense](https://code.visualstudio.com/docs/editor/intellisense) as we write out our SWR code.

### System scaling

For completeness' sake, let's consider one last scenario to imagine how this system would scale. In this case, we introduce another component that is similar but slightly different to the one in `LovelyNameComponent`. Instead of getting a single lovely name, our query returns an array of lovely names. Our system can handle this readily, using the same `SWRCacheKey` property.

```typescript
export const SWRCacheKeyGetters = {
  lovelyName: (lovelyId: string) => {
    return `${SWRCacheKey.lovelyName}-${lovelyId}`;
  },
  lovelyNames: (lovelyIds: string[]) => {
    return `${SWRCacheKey.lovelyName}-${lovelyIds?.join('-')}`;
  },
};
```

And there we have it -- thanks for reading, and happy revalidating!
