# Meier

Meier is a small tool to match pupils to events/groups according to their
preferences (green, yellow, red).

The name is borrowed from a class game where all pupils get cards with different
spelling of the common German family name Meier (like Meyer, Maier, Mair, Meir
and so on) and should find their mates with the same spelling all at the same
time.

## Usage

We use [devenv](https://devenv.sh/) for a simple setup of the development
environment. You can also install Roc and Go in another way and use the
respective build commands you find in the [Taskfile.yaml](Taskfile.yaml).

### Get submodules

    $ git submodule update --init

### Get Roc

    $ devenv shell
    $ task get-roc
    $ exit

### Build and run project

    $ devenv shell
    $ task build
    $ ./webserver

## License

MIT

## Credits

<img alt="Made with Bulma" src="https://bulma.io/images/made-with-bulma.png" height=24>

We use the CSS library [Bulma](https://bulma.io/) and the JS libraries
[htmx](https://htmx.org/) and [_hyperscript](https://hyperscript.org/). If you
build the binary of this project, Bulma's minified CSS file, htmx' minified JS
file and _hyperscript's minified JS file are included. Bulma is release under
the [MIT license](Server/assets/bulma/LICENSE). htmx is released under the [BSD
license](Server/assets/htmx/LICENSE). _hyperscript is released under the [BSD
license](Server/assets/_hyperscript/LICENSE).
