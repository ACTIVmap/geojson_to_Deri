deploiement :


Installer node : https://nodejs.org/fr/download

installer les différentes librairies :
dans un terminal lancer les commandes suivantes :

- npm install express
- npm install multer
- npm install fs
- npm install archiver



Pour lancer le serveur node, ouvrir un terminal à l'emplacement du fichier serveur.js :

node serveur.js


ouvrir :
http://localhost:3000/enquete.html





Les élèments à renseigner :

tablet size : taille de la tablette
- pour format A3 : 420, 297
- pour format A5 : 217,135

interactor size : taille des interacteurs en mm 
5

file interactor: Sélectionner les différents fichiers des interacteurs 
ex :
- building_interactors.geojson
- crossing_interactors.geojson
- island_interactors.geojson
- street_interactors.geojson
- water_interactors.geojson

title : titre

image : Sélectionner l'image de fond

size map : taille de la carte sur l'image (permet de calculer la position des interacteurs si elle est mal renseignée)
- pour format A3 : 340, 250
- pour format A5 : 163,102

lower_right : emplacement du coin droit de la carte (permet de calculer la position des interacteurs si elle est mal renseignée)
- pour format A3 : 407, 286
- pour format A5 : 211,129

coord file : permet de connaitre les coordonnées de la carte (permet de calculer la position des interacteurs si elle est mal renseignée)
ex : extent_A3_off.geojson

template interactor file : interacteur de la légende 
ex : A5_tablet_template_interactors_right.json


