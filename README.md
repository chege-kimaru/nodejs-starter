## NodeJs API Stater
### Major Technologies used
- Express js
- Sequelize ORM
### How to run
- Rename `.env-example` to `.env` and fill in the environment variables
```shell script
npm install
DB_USER=username DB_PASS=pass DB=dbname DB_HOST=localhost npx sequelize db:create
DB_USER=username DB_PASS=pass DB=dbname DB_HOST=localhost npx sequelize db:migrate
node . --port 3000


```
