# PowerBI-visuals-sampleBarChart
[![Build Status](https://travis-ci.org/Microsoft/PowerBI-visuals-samplebarchart.svg?branch=master)](https://travis-ci.org/Microsoft/PowerBI-visuals-samplebarchart)
Bar Chart Custom Visual sample.


### Setting Up Development Environment

Create host certs for https://localhost:8080 needed for https://app.powerbi.com/ live testing:

```bash
/bootstrap_host.dev.sh 
```

MS docs: [Install a certificate](https://docs.microsoft.com/en-us/power-bi/developer/visuals/environment-setup?tabs=sdk2osx)

Create PowerBI dev account:

* https://powerbi.microsoft.com/en-us/ -> start free
* pbi online account -> settings -> developers -> enable developer mode
* in a report (ex: HR), add a Developer visuals
* it will show a greyed component with "Can't contact visual server"

#### OS X


* The keygen stuff might do funny keychain stuff
  * keychain: search for 'localhost' and allow all
  * may not still work in chrome, but maybe in firefox
  * or a reboot
* If `./dc.dev.sh up` fails with `Error response from daemon: invalid mount config for type "bind": bind source path does not exist: /usr/local/lib/node_modules/powerbi-visuals-tools/certs`
  * In docker -> preferences -> resources -> file sharing: `/usr/local/lib/node_modules`
  * ... or wherever `npm list -g --silent | head -1` goes


### Build, launch, and live-edit

```bash
./dc.dev.sh build
./dc.dev.sh up
```

TLS-protected URL `https://localhost:8080/assets/status` should now work

* Go to report: https://app.powerbi.com/groups/me/reports/ce302f22-d702-4419-af92-ea4a8888722f/ReportSection2
* Edit (opens visual components panel)
* Add "Developer Visual" component (icon `</>`)

The component should now be connected