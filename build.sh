#!bash
# fixes active-window shell scripts after building app

rm -R dist

build --dir

cp -R lib/active-window/scripts dist/mac/neuroapp.app/Contents/Resources/