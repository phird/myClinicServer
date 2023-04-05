# myClinicServer

myClinicServer is built using nodemon.

## Installation - Server Side

Clone the myClinicServer repository
Run below command in console:

```bash
git clone https://github.com/phird/myClinicServer.git
```

Change the directory to myClinicServer using the following command:

```bash
cd myClinicServer
```

Install the required dependencies using npm. Make sure you have Node.js and npm installed on your system. If not, please install them before proceeding. Run the following command to install dependencies:

```bash
npm install
```

Create a .env file in the root directory of the project and set the following environment variables:

```bash
JWT_SECRET='your_jwt_secret'
JWT_REFRESH_TOKEN_SECRET= 'your_jwt_refresh_token_secret'
JWT_EXPIRE_TIME=10m
JWT_REFRESH_TOKEN_EXPIRE_TIME=10m

```

Note: Replace <your_jwt_secret> and <your_jwt_refresh_token_secret> with your own values.

TO config Database Connection go to config/index.js Folder

![Screenshot 1](/image/Screenshot%202566-04-05%20at%201.35.42%20PM.png)

Start the server using the following command:

```bash
nodemon index.js
```
