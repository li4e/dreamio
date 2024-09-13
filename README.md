1. Change firebase_project_id in .firebaserc
2. Install postgress locally with 123456 password
3. Set all secrets from api/src/confgi/secrets
   firebase functions:secrets:set SECRET_NAME
   To a firebase/environment/.secret.local, for local testing

#Migrate on prod

1. `cd ~ && ./cloud-sql-proxy dreamio-c6ece:us-central1:dreamiodb`
2. In another tab: `npx nx run db:migration:apply:PROD`
