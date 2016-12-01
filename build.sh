#!bash
# fixes active-window shell scripts after building app

rm lib/env.js
cp lib/env_prod.js lib/env.js

build --dir

cp -R lib/active-window/scripts dist/mac/neuroapp.app/Contents/Resources/

rm lib/env.js
cp lib/env_dev.js lib/env.js