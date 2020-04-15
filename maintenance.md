# System Maintenance

## Overview

This section will give some essential information about what to do after the system has been delivered. You (the client) will need to set up your own server and database. The system has been developed using the Google Cloud Platform MySQL database and a local server (only accessible by devices connected to the same network). However, this is only for testing purposes. If the system is put into use, you will need to pay for the costs of the server and database service(s). This part of the user manual will also give some information about predicting maintenance costs.

## Database

### Version

The testing database uses **MySQL 5.7** and is hosted by Google Cloud Platform. When setting up your own database, please make sure the database version of MySQL is below 8.0, as Node.js cannot authenticate to MySQL 8.0 and above due to the default authentication plugin in those versions. See <https://stackoverflow.com/questions/50373427/node-js-cant-authenticate-to-mysql-8-0> for more detailed information.

### Connecting to the Database

#### The `.env` File
The system requires an environment file, called *.env*, on the top level. This file contains the credentials needed to connect to the MySQL database, along with the secret values used for creating authentication tokens. The file contains the following keys, each with a corresponding value: `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PORT`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `USER_KEY` and `STAFF_KEY`. All values are strings except `MYSQL_PORT`.

#### Connection details for the Test Database
    ***REMOVED FROM GIT-HOSTED USER MANUAL***
Please note that this database is for testing purposes only, and *should not* be used for a deployed/live version of the system.

#### MySQL Workbench
MySQL workbench is a useful tool for setting up the MySQL database. Download MySQL workbench from <https://dev.mysql.com/downloads/workbench/> by selecting your operating system and downloading the corresponding file.

#### Creating a Connection
After opening MySQL Workbench, you will see a plus button after **MySQL Connections** in the home page. Click it and a window will show up. First, set up a **connection name** as any relevant name (e.g. "Group 22 Test Database"). Then, fill the **Hostname**, **Port**, **Username** and **Password** from the connection details above. Then click **OK**. The program will jump back to the home page and you will find a new connection instance has been created. Click this and you will be connected to the database editor.

### Database Structure

The database consists of six separate tables, which are: **users**, **sections**, **files**, **parent_comments**, **child_comments** and **logs**.

#### Table 1: **`users`**

| Column | Data Type  | Primary Key | Automatically Increment |
| ------ | ------ | ------ | ------ |
| user_id | int(11) | YES | YES |
| real_name | char(32) | NO | NO |
| username | char(32) | NO | NO |
| password | char(128) | NO | NO |
| password_salt | char(32) | NO | NO |
| is_admin | bit(1) | NO | NO |
| force_reset | bit(1) | NO | NO |
Note: `real_name` is the internal name for the user's *nickname*, which is not required to be the same as their real name to preserve anonymity.

#### Table 2: **`sections`**

| Column | Data Type  | Primary Key | Automatically Increment |
| ------ | ------ | ------ | ------ |
| section_id | int(11) | YES | YES |
| user_id | int(11) | NO | NO |
| article_text | text | NO | NO |
| section_name | char(32) | NO | NO |
| position | int(11) | NO | NO |

#### Table 3: **`files`**

| Column | Data Type  | Primary Key | Automatically Increment |
| ------ | ------ | ------ | ------ |
| file_id | int(11) | YES | YES |
| file_name | char(32) | NO | NO |
| file_link | text | NO | NO |
| section_id | int(11) | NO | NO |
| user_id | int(11) | NO | NO |

#### Table 4: **`parent_comments`**

| Column | Data Type  | Primary Key | Automatically Increment |
| ------ | ------ | ------ | ------ |
| parent_id | int(11) | YES | YES |
| user_id | int(11) | NO | NO |
| parent_comment | text | NO | NO |
| parent_title | char(32) | NO | NO |

#### Table 5:  **`child_comments`**

| Column | Data Type  | Primary Key | Automatically Increment |
| ------ | ------ | ------ | ------ |
| child_id | int(11) | YES | YES |
| user_id | int(11) | NO | NO |
| parent_id | int(11) | NO | NO |
| child_comment | text | NO | NO |

#### Table 6: **`logs`**

| Column | Data Type  | Primary Key | Automatically Increment |
| ------ | ------ | ------ | ------ |
| logId| int(11) | YES | YES |
| userId | int(11) | NO | NO |
| dateTime | datetime | NO | NO |
| action | char(32) | NO | NO |
| entity | char(32) | NO | NO |
| newData | json | NO | NO |
| oldData | json | NO | NO |

### Creating Your Own Database

You will need to select a platform (such as Google Cloud Platform or Microsoft Azure) to create a MySQL instance, and get the connection information. Then, use MySQL workbench to connect to the database. Use the provided resources, including the tables above to create a new database (see the tutorial for using the MySQL model to create a MySQL database at <https://www.youtube.com/watch?v=K6w0bZjl_Lw>.)After creating the new database, update the connection details in the .env file.

## Server

Our system has been developed and tested using a local server. To use this system, the client needs to create their own server (if they do not have a server) support it. The server running the Changing Lives website may be fit for this purpose.

## Predicting Maintenance Costs

The majority of the predicted maintenance costs will be the costs of the MySQL database and the server.

### MySQL Database Costs

The cost of a suitable MySQL database in Google Cloud Platform is $30-$100 (£24-£80) per month. However, the cost of MySQL database in Microsoft Azure is at least $130 (£105) per month.

### Server Costs

DigitalOcean offers many different price plans for servers, with the cheapest option at £5 per month and the recommended option at £40 per month.

## Future Development

During development, our code has been refactored into a more readable and learnable way to help with future additions and maintenance by the client. The API and application can be extended with new routes or features by using a copy of an existing route as a base to add the new functionality to, and updating the routes file to include it. This may require a corresponding extension to the database, which can be done by creating new columns or tables using MySQL workbench.
