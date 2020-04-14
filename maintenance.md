# Software Maintenance

## Overview

This part will give some essential information about what to do after the system has been delivered. Bascially, our client needs to set up its own server and database by its own account. The system is currently supported by Google Cloud Platform MySQL database and digital ocean server. However, it is only for testing. If our system is put into using, the client should pay for the costs of database service and server. In this part, it will give the information of predicting maintenance cost.

## Database

### Version Issue

Our database is currently in **MySQL 5.7** and hosted by Google Cloud Platform. The database is only for testing. If our system is put into use in the future, our client need to set up their won database and pay for the database service. Please make sure the database version of MySQL should be below 8.0 because Node.js cannot authenticate to MySQL 8.0 and above due to the default authentication plugin in MySQL 8.0 and abobe. [Clcik here for more detailed information.](https://stackoverflow.com/questions/50373427/node-js-cant-authenticate-to-mysql-8-0)

### Set up

MySQL workbench is a good tool for setting up the MySQL database. Please download MySQL workbench [here](https://dev.mysql.com/downloads/workbench/) by selecting your operation system and downloading corrsponding file.

### Connection

#### Connection details

    host_name : 35.205.8.141
    username : root
    port: 3306
    password : gry123456*
    database : changingLives

#### Open MySQL workbench

Search the **MySQL workbench** in the search function in your pc and open the application.

#### Create a connection

After opening MySQL workbench, you will see a plus button after **MySQL Connections** in the home page. Click it and a window will be showing up. First set up a **connection name** for whatever you like. Then fullfill **Hostname**, **Port**, **Username** and **password** from the connection details above. Then click **ok**. Then it jump back to the home page and you will find a new connection instance has been created. Just click it and you will connection to the database editor.

### Database Structure

Our database is made of six separate tables which are **child_comments**, **files**, **logs**, **parent_comments**, **sections** and **users**.

#### 1. Table **child_comments**

| Column | Data Type  | Primart Key | Automatically Increase |
| ------ | ------ | ------ | ------ |
| child_id | int(11) | YES | YES |
| parent_id | int(11) | NO | NO |
| child_comment | text | NO | NO |

#### 2. Table **files**

| Column | Data Type  | Primart Key | Automatically Increase |
| ------ | ------ | ------ | ------ |
| file_id | int(11) | YES | YES |
| file_name | char(32) | NO | NO |
| file_link | text | NO | NO |
| section_id | int(11) | NO | NO |
| user_id | int(11) | NO | NO |

#### 3. Table **logs**

| Column | Data Type  | Primart Key | Automatically Increase |
| ------ | ------ | ------ | ------ |
| logId| int(11) | YES | YES |
| userId | int(11) | NO | NO |
| dateTime | datetime | NO | NO |
| action | char(32) | NO | NO |
| entity | char(32) | NO | NO |
| newData | json | NO | NO |
| oldData | json | NO | NO |

#### 4. Table **parent_comments**

| Column | Data Type | Primart Key | Automatically Increase |
| ------ | ------ | ------ | ------ |
| parent_id | int(11) | YES | YES |
| userId | int(11) | NO | NO |
| parent_comment | text | NO | NO |
| parent_title | char(32) | NO | NO |

#### 5. Table **sections**

| Column | Data Type | Primart Key | Automatically Increase |
| ------ | ------ | ------ | ------ |
| section_id | int(11) | YES | YES |
| userId | int(11) | NO | NO |
| section_name | char(32) | NO | NO |
| position | int(11) | NO | NO |

#### 6. Table **users**

| Column | Data Type | Primart Key | Automatically Increase |
| ------ | ------ | ------ | ------ |
| user_id | int(11) | YES | YES |
| user_name | char(32) | NO | NO |
| password | char(128) | NO | NO |
| password_Salt | bit(1) | NO | NO |
| force_reset | bit(1) | NO | NO |

### Rebuild the database

Client should select the platform, such as Google Cloud Platform and Microsoft Azure, to create a MySQL instance and get the coonnection information. Then, use MySQL workbench to connect to the database. See the [tutorial](https://www.youtube.com/watch?v=K6w0bZjl_Lw) for using the MySQL model to create MySQL database. After creating the new database, renew the connection details in the env file.

## Server

Currently our system is supported by local host and a digitalocean server for testing. In the future, Changing Lives needs to create their own server (if they do not have a server) to support the system. As we known there are some staffs in charge of techinique in Changing Lives so that it is not necessary to tell them how to set up a server because Changing Lives already has a running website.

## Predicting Maintenance Cost

The majority of predicting maintenance cost should be the cost of MySQL database and server.

### Cost of MySQL Database

The cost of suitable MySQL database in Google Cloud Platform is $30-$100 (£24 - £80) per month. However, the cost of MySQL database in Microsoft Azure is at least $130 (£105) per month.

### Cost of Server

The cost of server in digitalocean is at least 5£ per month.

## Code Refactoring

Our code has been all refactored into a more readable and learnable way. It is much more easy for the staff in Changing Lives or their maintenance team to learn our code for the purpose for scaling  or reengineering the system.

## Development in the Future

If the client wants to add some new features in the system, the client should add the api file in Changing Lives api. Add a new table or column in MySQL database if necessary.
