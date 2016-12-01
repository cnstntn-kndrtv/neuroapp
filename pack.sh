#!bash
# fixes active-window shell scripts after building app

echo "process.env.IS_BUILD = true;" > lib/env.js
build --dir

rm lib/env.js