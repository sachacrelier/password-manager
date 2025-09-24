# Password Manager

Un gestionnaire de mots de passe local et sécurisé, développé avec Electron, JavaScript, HTML et CSS.

## Fonctionnalités

- **Gestion des mots de passe** : ajouter, modifier, supprimer, rechercher et copier en un clic.
- **Catégories personnalisables** : crée, édite et supprime tes propres catégories avec des icônes emoji.
- **Stockage local** : toutes les données restent sur ton ordi via `localStorage`. Pas de serveur, pas de fuite.
- **Fenêtres modales** : confirmation avant suppression, ajout/édition via popups claires.
- **Thème clair/sombre** : change de style quand tu veux.
- **Force du mot de passe** : affichage du niveau de sécurité.
- **Stats rapides** : nombre total de mots de passe et de catégories affiché.

## Installation

1. Clone le repo :
   ```bash
   git clone https://github.com/sachacrelier/password-manager.git
   cd password-manager
   ```
2. Installe les dépendances :
   ```bash
   npm install
   ```
3. Lance l'application :
   ```bash
   npm start
   ```

## Sécurité
- Les mots de passe ne quittent jamais votre machine.
- Pas de synchronisation cloud, pas de serveur.