# Changing Lives API Documentation


## Endpoints


### User Endpoints


#### Create

| Route | `/api/users/create`|
|:----------:|----------|
| Type | POST |
| Body | `{'realName': string, 'isAdmin': bit}` |
| Response | <ul><li>No errors: Status 200 and `{'password': string, 'username': string}`</li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


#### Remove

| Route | `/api/users/remove`|
|:----------:|----------|
| Type | POST |
| Body | `{'userId': integer, 'password': string}` |
| Response | <ul><li>No errors: Status 200 </li><li>No permission: Status 403</li><li>Could not delete: Status 400</li><li>Errors: Status 500</li></ul> |


#### Change

| Route | `/api/users/change`|
|:----------:|----------|
| Type | POST |
| Body | `{'realName': string, 'isAdmin': bit}` |
| Response | <ul><li>No errors: Status 200 </li><li>No permission: Status 403</li><li>Could not change: Status 400</li><li>Errors: Status 500</li></ul> |


#### Edit

| Route | `/api/users/edit`|
|:----------:|----------|
| Type | POST |
| Body | `{'nickname': string, 'userId': bit}` |
| Response | <ul><li>No errors: Status 200 </li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


#### Reset

| Route | `/api/users/reset`|
|:----------:|----------|
| Type | POST |
| Body | `{'userId': bit}` |
| Response | <ul><li>No errors: Status 200 </li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


#### Login

| Route | `/api/users/login`|
|:----------:|----------|
| Type | POST |
| Body | `{'userName': string, 'userPassword': string}` |
| Response | <ul><li>No errors: Status 200 </li><li>No permission: Status 403</li><li>Input validation failed: Status 400</li><li>Incorrect username/password: Status 401</li><li>Errors: Status 500</li></ul> |


#### List

| Route | `/api/users/list/?search=string&uname=string&rname=string`|
|:----------:|----------|
| Type | GET |
| Response | <ul><li>No errors: Status 200 and `[user0, user1...]`</li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


### Section Endpoints


#### Create 

| Route | `/api/sections/create`|
|:----------:|----------|
| Type | POST |
| Body | `{'sectionName': string, 'sectionText': string, 'files': array}` |
| Response | <ul><li>No errors: Status 200 </li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


#### Edit

| Route | `/api/sections/edit`|
|:----------:|----------|
| Type | POST |
| Body | `{'sectionName': string, 'sectionText': string, 'sectionId': integer, 'files': array, 'fileRemove': jsonBody` |
| Response | <ul><li>No errors: Status 200 </li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


#### Move

| Route | `/api/sections/move`|
|:----------:|----------|
| Type | POST |
| Body | `{'sectionId': integer, 'moveUp': string}` |
| Response | <ul><li>No errors: Status 200 </li><li>No permission: Status 403</li><li>No section provided: Status 400</li><li>Errors: Status 500</li></ul> |


#### Remove

| Route | `/api/sections/remove`|
|:----------:|----------|
| Type | POST |
| Body | `{'sectionId': integer}` |
| Response | <ul><li>No errors: Status 200 </li><li>No permission: Status 403</li><li>No section provided: Status 400</li><li>Errors: Status 500</li></ul> |


#### Restore

| Route | `/api/sections/restore`|
|:----------:|----------|
| Type | POST |
| Body | `{'sectionName': string, 'sectionText': string, 'sectionFiles': jsonBody}` |
| Response | <ul><li>No errors: Status 200 </li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


#### List

| Route | `/api/sections/list/?sectionId=integer`|
|:----------:|----------|
| Type | GET |
| Response | <ul><li>No errors: Status 200 and `[section0, section1...]`</li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


### Log Endpoints

#### List 

| Route | `/api/logs/list/?seach=string&uname=string&ename=string&action=string&entity=string&sdate=string&edate=string`|
|:----------:|----------|
| Type | GET |
| Response | <ul><li>No errors: Status 200 and `[log0, log1...]`</li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


### Files Endpoints

#### List

| Route | `/api/files/list`|
|:----------:|----------|
| Type | POST |
| Body | `{'sectionId': integer}` |
| Response | <ul><li>No errors: Status 200 and `[file0, file1...]`</li><li>Error querying data: Status 400</li><li>Errors: Status 500</li></ul> |


### Forums (Parent) Endpoints


#### Create

| Route | `/api/forums/parent/create`|
|:----------:|----------|
| Type | POST |
| Body | `{'parentTitle': string, 'parentComment': string}` |
| Response | <ul><li>No errors & Resource created: Status 201 </li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


#### Remove

| Route | `/api/forums/parent/remove`|
|:----------:|----------|
| Type | POST |
| Body | `{'parentId': integer}` |
| Response | <ul><li>No errors: Status 200</li><li>Error querying data: Status 400</li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


#### Restore

| Route | `/api/forums/parent/restore`|
|:----------:|----------|
| Type | POST |
| Body | `{'parentId': integer, 'creatorId': integer, 'parentTitle': string, 'parentComment': string}` |
| Response | <ul><li>No errors & Resource created: Status 201 </li><li>Forum no longer available: Status 410</li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


#### List

| Route | `/api/forums/parent/list/?search=string`|
|:----------:|----------|
| Type | GET |
| Response | <ul><li>No errors: Status 200 and `[file0, file1...]`</li><li>Error querying data: Status 400</li><li>Errors: Status 500</li></ul> |


### Forums (Child) Endpoints


#### Create

| Route | `/api/forums/child/create`|
|:----------:|----------|
| Type | POST |
| Body | `{'parentId': integer, 'childComment': string}` |
| Response | <ul><li>No errors & Resource created: Status 201 </li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


#### Remove

| Route | `/api/forums/child/remove`|
|:----------:|----------|
| Type | POST |
| Body | `{'childId': integer}` |
| Response | <ul><li>No errors: Status 200</li><li>Error querying data: Status 400</li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


#### Restore

| Route | `/api/forums/child/restore`|
|:----------:|----------|
| Type | POST |
| Body | `{'creatorId': integer, 'parentId': integer, 'childComment': string}` |
| Response | <ul><li>No errors & Resource created: Status 201 </li><li>Forum no longer available: Status 410</li><li>No permission: Status 403</li><li>Errors: Status 500</li></ul> |


#### List

| Route | `/api/forums/child/list/?parentId=integer`|
|:----------:|----------|
| Type | GET |
| Response | <ul><li>No errors: Status 200 and `[file0, file1...]`</li><li>Error querying data: Status 400</li><li>Errors: Status 500</li></ul> |
