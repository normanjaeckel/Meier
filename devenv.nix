{ pkgs, ... }:

{
  # See full reference at https://devenv.sh/reference/options/

  languages.go.enable = true;

  packages = [
    pkgs.git
    pkgs.go-task
  ];

  enterShell = ''
    ROCDIR="$(pwd)/$(find . -type d -iname 'roc_nightly*' | head -n 1)"
    PATH=$ROCDIR:$PATH
  '';
}
