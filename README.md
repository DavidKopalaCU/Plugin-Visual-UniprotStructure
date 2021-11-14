# Plugin-Visual-UniprotStructure
A visual plugin for SynBioHub (SBH) that displays the folded structure of a protein using data from

# Getting Started
## Using docker
Until this project is available on DockerHub, you will need to build the container manually.
```bash
$ docker build -t plugin-visual-uniprotstructure .
$ docker run -d plugin-visual-uniprotstructure
```
Confirm it is running by loading http://localhost:8080/status

> The Dockerfile takes care of building the project (including Javascript files) and exposing port 8080.

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