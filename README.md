# spotify-with-node-js
## download-playlist-spotify
Download-playlist-spotify est une application web qui permet de télècharger vos playlists spotify en mp3 peu importe la taille de la playlist ! Lorsque votre playlist est prête un mail est envoyé avec le lien de télèchargement. L'application ne nécessite pas de compte spotify prenium !

download-playlist-spotify utilise l'API spotify et spotdl un outil de conversion mp3 open source. L'application utilise node.js pour traiter les requêtes.

Le lien de l'application spotdl en ligne de commande : https://github.com/ritiek/spotify-downloader.git
le lien vers l'api spotify : https://developer.spotify.com/documentation/web-api/

ATTENTION LINUX UNIQUEMNT !!

## Préambule : API spotify
L'application utilise l'API spotify, il faut dans un premier temps avoir un compte spotify, se connecter au site mentionné au-dessus. L'onglet dashbord va permettre d'enregistrer votre application auprès de spotify. Pour cela il faut demander un client id et renseigner les différents champs. A la question  "What are you building?" répondre "web". Cliquer sur next et "non-commercial". Spotify va alors vous donner un client id et un client secret. Il faut les renseigner dans les variables de app.js prevu à cet effet. Dans l'onglet "edit setting" redirect URIs vous devez mettre "http://localhost:8888/callback" si vous travaillez en local. La configuration de l'API spotify est terminé. L'onglet dashbord permet de visualiser le trafic des requêtes vers l'API.


## Instalation de spotdl :
Il faut installer le paquet en ligne de commande. (voir la documentation si besoin)
Spotdl est un outil capable de convertir l'url d'une playlist spotify en fichier texte. Le fichier texte contient alors des titres à télècharger. Dans un second temps spotdl va chercher sur youtube le titre de la musique pour le télècharger avec youtube mp3 par exemple.  

## Lancement de app.js pour lancer l'application web :
Le fichier package.json contient les modules pour faire focntionner l'application. Dans le répertoire courant dans un terminal : npm i. Ceci va créer un répertoire node_modules avec les modules pour le fonctionnement. 
Ouvrir un terminal, et lancer node app.js. Dès à present vous pouvez ouvrir un navigateur web et taper l'url suivante "localhost:8888/". Dans le fichier app.js ajouter son mail & mot de passe il s'agit de l'adresse du mail qui va être envoyé aux clients avec le lien ! 

## Explication du fonctionnement général :
Lors du lancement de l'application sur un navigateur. L'application va envoyer ses identifiants (clientId & clientSecret) à l'API spotify. L'application va ainsi recevoir un token d'identification (voir documentation API spotify). Ce token va être utilisé pour faire les requêtes vers l'API spotify par la suite.
L'utilisateur va se connecter à son compte spotify (gratuit) il va ainsi visualiser l'emsemble de ses playlists. Lorsqu'il va cliquer sur une des playlists ça va envoyer une requête sur le serveur. Le serveur va lancer un processus. Il s'agit d'un sous-processus avec avec spotdl et les bons arguments pour créer un fichier texte de la playlist. Le fichier va être dans le repertoire list au format ".txt". Un dossier va être créé dans le repertoire "playlist" (Il va contenir les musqiues au format mp3). Un nouveau processus est lancé pour télècharger les musiques dans le repertoire. Le télèchargement peut prendre du temps en fonction de la taille de la playlist ! Une fois le télèchargement terminé un ".zip" est créé de la playlist avec un nom aléatoire dans le répertoire public. Un mail est envoyé à l'utilisateur avec le lien du nom de sa playlist. Le lien propose de télècharger le fichieer .zip

## Compte Gmail
Il faut une adresse mail gmail et supprimer la double authentification pour permettre au module de mail de se connecter. 

## Les prochaines améliorations ?
- Utiliser un vault pour les tokens 



## Copyright
L'application ne peut être utilisé pour un usage "grand public". Les droits d'auteur ne sont pas respectés !
