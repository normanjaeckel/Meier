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
