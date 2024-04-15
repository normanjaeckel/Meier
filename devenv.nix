{ pkgs, ... }:

{
  # See full reference at https://devenv.sh/reference/options/

  languages.go.enable = true;

  packages = [
    pkgs.git
    pkgs.go-task
  ];

  enterShell = ''
    ROCDIR=$(pwd)/roc-dir
    # ROCDIR="$(pwd)/roc/target/release"
    # ROCDIR="$(pwd)/roc/target/debug"
    PATH=$ROCDIR:$PATH
  '';
}
