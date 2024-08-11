<p align="center">
  <a href="https://example.com/">
    <img src="https://jonze.co/logo.svg" alt="Logo" width=72 height=72>
  </a>

  <h3 align="center">Jonze</h3>

  <p align="center">
    Open Source Member Management
    <br>
    <a href="https://github.com/Pelps12/jonze/issues/new">Report bug</a>
    ·
    <a href="https://github.com/Pelps12/jonze/issues/new">Request feature</a>
  </p>
</p>

## Streamlining organization management

Jonze is an open source member management software primarily aimed at school orgs. Other software tools are either aimed for different kinds of organizations and does not fit org use cases. With Jonze, school orgs can focus less on the complexity of attendance tracking and membership dues and more on direct member engagement.

## Codebase Structure

Jonze is built with Turborepo and contains the following packages/apps:

### Apps and Packages

- `api`: a [Hono](https://hono.dev/) server that is the API for all custom dev use cases
- `docs`: a [Mintlify](https://mintlify.com) app that contains all developer documentation
- `web`: a [SvelteKit](https://kit.svelte.dev/) app for the main admin and user functionality
- `@repo/db`: a library for the drizzle library, migrations, and schema
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/webhooks`: a package for the Svix webhook client

## Bugs and feature requests

If you have a problem or idea that could greatly contribute to Jonze, [please open a new issue](https://github.com/Pelps12/jonze/issues/new).

## Contributing

There is currently no guide on how to contribute. Reach out to oluwapelps@gmail.com for any thing you need.

## Creators

**Creator 1**

- <https://github.com/Pelps12>

## Thanks

If you like what I'm working on with Jonze, feel free to give Jonze a star :)

## Copyright and license

Code and documentation copyright 2023-2024 the authors. Code released under the [MIT License](https://reponame/blob/master/LICENSE).

Enjoy :metal:
