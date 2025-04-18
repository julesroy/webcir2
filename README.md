# Projet WEB CIR2

---

### LEBRUN Adèle - LEROY Simon - ROY Jules - VAN UYTVANCK Mathis

---

## Description et fonctionnalités :

Notre projet propose plusieurs mini-jeux sur le thème des vêtements :
- Un "memory" : il faut retrouver les paires de vêtements identiques.
- Un "catcher" : il faut attraper les vêtements qui tombent dans un panier.
- Un "cashier" : il faut donner la bonne somme des éléments présents sur la caisse.

Chaque jeu a un score, quand la partie se termine, le score est ajouté à la base de données et le joueur peut aller consulter les meilleurs scores sur la page des scores.

Notre projet permet également de créer un compte ou de se connecter, de changer ses informations (mail, pseudo, mot de passe) et de se déconnecter.

Le code et les assets de chaque mini-jeu sont dans le dossier `public/games`, et disposent chacun de leur propre dossier.

## Technologies utilisées :

- Node.js
- Express.js
- Phaser.js
- EJS
- Tailwind CSS
- SQLite

## Installation :

Se placer dans le dossier du projet et exécuter la commande suivante :

```bash
npm install
```

## Lancer le projet :

Se placer dans le dossier du projet et exécuter la commande suivante :

```bash
npm run dev
```

## Base de données :

Nous avons choisi d'utiliser SQLite pour la base de données. Pour visualiser les données de cette base, le logiciel `DB Browser (SQLite)` peut être utilisé (gratuit). Le fichier de la base de données est `database.db`. Cette base de données contient 2 tables, `utilisateurs` et `scores` :

| utilisateurs  |                                                             |
|---------------|-------------------------------------------------------------|
| idUtilisateur | L'id de l'utilisateur (unique)                              |
| email         | Email de l'utilisateur                                      |
| username      | Pseudo de l'utilisateur                                     |
| mdp           | Mot de passe de l'utilisateur (hashé pour plus de sécurité) |

| scores        |                                               |
|---------------|-----------------------------------------------|
| idScore       | L'id du score (unique)                        |
| username      | Pseudo de l'utilisateur qui a obtenu le score |
| score         | Score obtenu                                  |
| idJeu         | L'id du jeu sur lequel le score a été obtenu  |
| idUtilisateur | L'id de l'utilisateur qui a obtenu le score   |

## Outils :

- Phaser.js : nous avons utilisé cette librairie pour les jeux "Memory" et "Catcher".

- Prettier : le fichier `.prettierrc` et la commande `npm run format` permettent de formater le code (js et ejs).

- Nodemon : le fichier `nodemon.json` permet de redémarrer le serveur automatiquement lors de la modification d'un fichier. Il est lancé par la commande `npm run dev`.

- Bcrypt : la bibliothèque nous a permis de hashé les mots de passe pour plus de sécurité.

- Tailwind CSS : le framework CSS que nous avons utilisé pour le CSS de ce projet. Il est configuré dans le fichier `tailwind.config.js` et est généré par la commande `npm run build :css`.

## Bonus - Déploiement :

En dehors du lancement de ce projet en local comme indiqué ci-dessus, il est possible de le tester sur un serveur distant, nous l'avons déployé à l'adresse suivante : [webcir2.alwaysdata.net](https://webcir2.alwaysdata.net/)