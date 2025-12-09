[![devnet-bundle-snapshot](https://github.com/conterra/mapapps-related-tables/actions/workflows/devnet-bundle-snapshot.yml/badge.svg)](https://github.com/conterra/mapapps-related-tables/actions/workflows/devnet-bundle-snapshot.yml)
![Static Badge](https://img.shields.io/badge/requires_map.apps-4.20.0-e5e5e5?labelColor=%233E464F&logoColor=%23e5e5e5)
![Static Badge](https://img.shields.io/badge/tested_for_map.apps-4.20.0-%20?labelColor=%233E464F&color=%232FC050)
# Related Tables

The Related Tables bundle adds a new popup to the app to display data from related tables.

![Screenshot App](https://github.com/conterra/mapapps-related-tables/blob/main/screenshot.JPG)

The Related Tables bundle for Linie 3 can be found in the 3.x branch:
https://github.com/conterra/mapapps-related-tables/tree/3.x

## Sample App
https://demos.conterra.de/mapapps/resources/apps/public_demo_relatedtables/index.html



[dn_relatedtables Documentation](https://github.com/conterra/mapapps-related-tables/tree/master/src/main/js/bundles/dn_relatedtables)

⚠️**Attention the new version 6.x has a different configuration than the previous version 5**
The relationship templates are now configured via the relationship-IDs and not via the IDs of the linked layers as before.

## Quick start

Clone this project and ensure that you have all required dependencies installed correctly (see [Documentation](https://docs.conterra.de/en/mapapps/latest/developersguide/getting-started/set-up-development-environment.html)).

Then run the following commands from the project root directory to start a local development server:

```bash
# install all required node modules
$ mvn initialize

# start dev server
$ mvn compile -Denv=dev -Pinclude-mapapps-deps

# run unit tests
$ mvn test -P run-js-tests,include-mapapps-deps
```
