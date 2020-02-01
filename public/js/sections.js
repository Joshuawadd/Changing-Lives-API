var sections;
var currentSection;
var fileLimbo;
var fileRemove = [];

var getCookie;
var loginPrompt;

class SecFile {
    constructor(id=0,title = '',path='') {
        this.id = id;
        this.title = title;
        this.path = path;
    }

}
class Section { //this is the class for an app section or page
    constructor(id=0,name = '',text='No text added',position=0, files = []) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.position =position;
        this.files = files;
    }

    listHTML() {
        return `<li class="list-group-item"><h4>${this.name}</h4>
                    <span class="badge badge-dark"><a href="#" id="edit_btn_${this.id}" onclick="editSection(event,${this.id});">Edit</a></span>
                    <span class="badge badge-dark"><a href="#" id="mvup_btn_${this.id}">Move Up</a></span>
                    <span class="badge badge-dark"><a href="#" id="mvdn_btn_${this.id}">Move Down</a></span>
                    <span class="badge badge-dark"><a href="#" id="rmve_btn_${this.id}" onclick="rmSection(event,${this.id},'${this.name}');">Remove</a></span>
                </li>`;
    }
}

//REST FUNCTIONS

async function getSections() {
    try {
        let authToken = getCookie('authToken');
        let response = await fetch('/api/section/list?token='+authToken);
        if (response.ok) {
            let body = await response.text();
            let contentData = JSON.parse(body);
            let sects = [];
            for (var i = 0; i < contentData.length; i++) {
                let fils = contentData[i].files.map((f) => new SecFile(f.id, f.title, f.path));
                let sc = new Section(contentData[i].id,contentData[i].name,contentData[i].text,contentData[i].position,fils);
                sects.push(sc);
            }
            return sects;
        } else if (response.status === 403) {
            alert('Your session may have expired - please log in.');
            loginPrompt();
            return false;
        } else {
            throw new Error(response.status+' '+response.statusText);
        }
    } catch(error) {
        alert(error);
        return false;
    }
}

async function addSection(event) {
    try {
        event.preventDefault();
        let authToken = getCookie('authToken');
        let sectionName = document.getElementById('section_name').value;
        let sectionText = document.getElementById('section_text').value;
        let data = new FormData();
        for (var i = 0; i < fileLimbo.length; i++) { //add all the unadded files
            data.append('section_files[]', fileLimbo[i]);
        }
        data.append('sectionName', sectionName);
        data.append('sectionText', sectionText);
        //data.append('sectionId', currentSection); not required for new sections
        let fileList = [];
        let len = fileLimbo.length;
        for (var j = 0; j < len; j++) {//update the display titles of all files
            fileList.push(document.getElementById(`file_title${j}`).value);
        }
        data.append('fileTitles', JSON.stringify(fileList));
        let response = await fetch('/api/section/create',
            {
                method: 'POST',
                headers: {
                    'Authorisation': authToken,
                },
                body: data
            });
        if (response.ok) {
            alert('Section added successfully!');
            $('#section_modal').modal('hide');
            fileLimbo = [];
            document.getElementById('file_adder').value = '';
            document.getElementById('file_adder_label').innerText = 'Choose file(s)';
            document.getElementById('content').click();
            return true;
        } else if (response.status === 403){
            alert('Your session may have expired - please log in.');
            await loginPrompt();
            $('.modal').modal('hide');
            $('#section_modal').modal('show');
        } else {
            throw new Error(response.status+' '+response.statusText);
        }
    } catch(error) {
        alert(error);
        return false;
    }
}

async function updateSection(event) {
    event.preventDefault();
    try {
        let authToken = getCookie('authToken');
        let sectionName = document.getElementById('section_name').value;
        let sectionText = document.getElementById('section_text').value;
        let data = new FormData();
        for (let i = 0; i < fileLimbo.length; i++) { //add all the unadded files
            data.append('section_files[]', fileLimbo[i]);
        }
        data.append('sectionName', sectionName);
        data.append('sectionText', sectionText);
        data.append('sectionId', currentSection);
        var fileList = [];
        for (let k = 0; k < sections.length; k++) {
            if (sections[k].id == currentSection) {
                fileList = sections[k].files;
            }
        }
        var files = [];
        for (var j = 0; j < fileList.length; j++) {//update the display titles of section files
            if (fileRemove.indexOf(fileList[j].id) == -1) {
                files.push(new SecFile(fileList[j].id,document.getElementById(`file_title${j}`).value,fileList[j].path));
            } else {
                files.push(new SecFile(fileList[j].id,'',fileList[j].path));
            }
        }
        for (var k = j; k < j+fileLimbo.length; k++) {//update the display titles of new files
            files.push(new SecFile(-1,document.getElementById(`file_title${k}`).value,''));
        }
        data.append('files', JSON.stringify(files));
        data.append('fileRemove', JSON.stringify(fileRemove));
        let response = await fetch('/api/section/edit',
            {
                method: 'POST',
                headers: {
                    'Authorisation': authToken,
                },
                body: data
            });
        if (response.ok) {
            alert('Section edited successfully!');
            $('#section_modal').modal('hide');
            document.getElementById('content').click();
            fileLimbo = [];
            document.getElementById('file_adder').value = '';
            document.getElementById('file_adder_label').innerText = 'Choose file(s)';
            return true;
        } else if (response.status === 403){
            alert('Your session may have expired - please log in.');
            await loginPrompt();
            $('.modal').modal('hide');
            $('#section_modal').modal('show');
        } else {
            throw new Error(response.status+' '+response.statusText);
        }
    } catch(error) {
        alert(error);
        return false;
    }
}

async function rmSection(event, sec_id, sec_name) {
    try {
        event.preventDefault();
        if (window.confirm(`Are you sure you want to remove the section: ${sec_name}?`)) {
            let response = await fetch('/api/section/remove',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorisation': getCookie('authToken'),
                    },
                    body: 'section_id=' + sec_id
                });
            if (response.ok) {
                alert('Section removed successfully!');
                document.getElementById('content').click();
            } else if (response.status === 403){
                alert('Your session may have expired - please log in.');
                loginPrompt();
            } else {
                throw new Error(response.status+' '+response.statusText);
            }
        }
    } catch(error) {
        alert(error);
        return false;
    }
}

//OTHER FUNCTIONS

async function contentClick(event) { //triggers when the content tab is clicked on
    //the code for loading the content modification area goes here
    event.preventDefault();
    sections = await getSections();
    if (sections) {
        //build the section HTML (my intent is for the position class variable to be position in the list as well to make this easier)
        let sectionsHTML = '<h3>Content Editor</h3> <button type="button" class="btn btn-outline-dark btn-sm" onclick="newSection()">New Section</button><br><div class="list-group">';
        for (var i = 0; i < sections.length; i++) {
            sectionsHTML += sections[i].listHTML();
        }
        sectionsHTML += '</div>';
        //set it to display
        document.getElementById('main_content').innerHTML = sectionsHTML;
    }
}

function newSection() { //this loads up the box for creating a new section
    document.getElementById('section_edit_title').innerText = 'New Section';
    document.getElementById('section_name').value = '';
    document.getElementById('section_text').value = '';
    document.getElementById('file_box_list').innerHTML = '';
    fileLimbo = [];
    fileRemove = [];
    currentSection = -1; //this signifies to create a new one
    refreshFileList();
    $('#section_modal').modal('show');
}

function editSection(event,sectionId) { //this loads up the box for editing a section
    event.preventDefault();
    document.getElementById('section_edit_title').innerText = 'Edit a section';
    for (var i = 0; i < sections.length; i++) {
        if (sections[i].id == sectionId) {
            document.getElementById('section_name').value = sections[i].name;
            document.getElementById('section_text').innerText = sections[i].text;
        }
    }
    currentSection = sectionId;
    fileLimbo = [];
    fileRemove = [];
    refreshFileList();
    $('#section_modal').modal('show');
}

function refreshFileList() { //this function keeps the file list up to date
    let display = '';
    let fileList = [];
    for (var k = 0; k < sections.length; k++) {
        if (sections[k].id == currentSection) {
            fileList = sections[k].files;
        }
    }
    for (var j = 0; j < fileList.length; j++) {
        if (fileRemove.indexOf(fileList[j].id) == -1) {
            display += `<div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <div class="ellipsis">
                                    <span class="input-group-text" id="file_name${j}">${fileList[j].path}</span>
                                </div>
                            </div>
                            <input name="file_title" id ="file_title${j}" type="text" class="form-control" placeholder="Display Title" maxlength="20" required value="${fileList[j].title}"> 
                            <div class="input-group-append">
                                <button class="btn btn-success" type="button" id="file_view${j}" onclick="(function(){window.open('./files/${fileList[j].path}?token=${getCookie('authToken')}','_blank');})();">View</button>
                            </div>
                            <div class="input-group-append">
                                <button class="close" type="button" id="file_delete${j}" onclick="removeFileDB(${j})">&times;</button>
                            </div>
                        </div>`;
        }
    }
    for (var i = j; i < fileLimbo.length+j; i++) {
        display += `<div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <div class="ellipsis">
                                <span class="input-group-text" id="file_name${i}">${fileLimbo[i-j].name}</span>
                            </div>
                        </div>
                        <input name="file_title" id ="file_title${i}" type="text" class="form-control" required maxlength="20" placeholder="Display Title" value="${fileLimbo[i-j].name.slice(0,-4)}"> 
                        <div class="input-group-append">
                            <button class="btn btn-success" type="button" id="file_view${i}" disabled>View</button>
                        </div>
                        <div class="input-group-append">
                            <button class="close" type="button" id="file_delete${i}" onclick="removeFile(${i})">&times;</button>
                        </div>
                    </div>`;
    }
    document.getElementById('file_box_list').innerHTML = display;
}
function removeFile(filePos) { //this is for files not yet on the db
    for (var k = 0; k < sections.length; k++) {
        if (sections[k].id == currentSection) {
            var fileList = sections[k].files;
            break;
        }
    }
    let ind = filePos - fileList.length;
    fileLimbo.splice(ind,1);
    refreshFileList();
}

function removeFileDB(filePos) {
    for (var k = 0; k < sections.length; k++) {
        if (sections[k].id == currentSection) {
            break;
        }
    }
    fileRemove.push(sections[k].files[filePos].id);
    //sections[k].files.splice(filePos,1);
    refreshFileList();
}

function addFile() { //this adds a file to the list, but does nothing on the server
    let filer = document.getElementById('file_adder');
    for (var i = 0; i < filer.files.length; i++) {
        fileLimbo.push(filer.files.item(i));
    }
    document.getElementById('file_adder').value = '';
    document.getElementById('file_adder_label').innerText = 'Choose file(s)';
    refreshFileList();
}
