# Plugin-Visual-UniprotStructure
A visual plugin for SynBioHub (SBH) that displays the folded structure of a protein using data from

# Getting Started
## First Steps
Create a symlink for the static directory
```bash
$ cd plugin-visual-uniprotstructure
$ npm install
$ npm run build
$ ln -s build/static static
```
## Using docker
Until this project is available on DockerHub, you will need to build the container manually.
```bash
$ docker build -t plugin-visual-uniprotstructure .
$ docker run -d -p 8080:8080 plugin-visual-uniprotstructure
```
Confirm it is running by loading http://localhost:8080/status

> NOTE: The Dockerfile takes care of building the project (including Javascript files).

## Register with SynBioHub
Register the plugin with SynBioHub by adding `http://<IP_ADDRESS>:8080/` to the plugins section of the Admin menu, where `IP_ADDRESS` is the IP Address of the machine hosting the plugin.

## Using Python
Run `pip install -r requirements.txt` to install the requirements. Then run `FLASK_APP=app python -m flask run`. A flask module will run at http://localhost:5000/.

# Overview
## Backend
The server is power by Flask, and contains the endpoints necessary for any SBH plugin, `/status`, `/evaluate`, and `/run`.

### /status
Simply returns a `200 OK` response, indicating that the plugin is online and ready to respond to requests.

### /evaluate
Determines whether or not this plugin should be displayed for a type of RDF. A `200 OK` response is returned if the type is supported, otherwise a `415 Unsupported Media Type` is returned. Currently, only `Component` types are allowed.

### /run
Returns the HTML that should be rendered on SynBioHub.
Specifically, this returns a React app and its bundled JS files. The index page/inserted HTML is generated at run time to include the SBOL RDF that this plugin should visualize. This makes it available to the JS on the client's browser.

## Frontend
As mentioned above, the front end is powered by React. Once the plugin is loaded, a BLAST query is performed on Uniprot by calling another API endpoint of this plugin. The results are fed into [Nightingale](https://github.com/ebi-webcomponents/nightingale) to generate the visualization.