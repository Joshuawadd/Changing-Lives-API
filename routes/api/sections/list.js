const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

class Section { //this is the class for an app section or page
    constructor(id=0,name = '',text='No text added',position=0, files=[['name','path']]) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.position =position;
        this.files = files;
    }
}

router.get('/', (req, res) => {
    try {
        var token = req.query.token;
        jwt.verify(token, 'userToken', function(err, decoded){
            if(!err){
                const connection = mysql.createConnection({
                    host: process.env.MYSQL_HOST,
                    user: process.env.MYSQL_USER,
                    password: process.env.MYSQL_PASSWORD,
                    database: process.env.MYSQL_DATABASE
                });

                connection.connect((err) => {
                    if (err) throw err;
                });

                function getList(){
                    return new Promise((resolve, reject) => {
                        connection.query(`SELECT sections.section_id, sections.article_text, sections.section_name, files.file_name, files.file_link FROM sections
                                            LEFT JOIN files ON sections.section_id = files.section_id
                                            `, [], (err, results) => {
                            if (err) throw res.sendStatus(400);
                            resolve(results);
                        });
                    });
                }
                getList().then(result => {
                    let contentData = result;
                    let sects = [];
                    for (var i = 0; i < contentData.length; i++) {
                        let nw = -1;
                        for (var j = 0; j < sects.length; j++) {
                            if (contentData[i].section_id == sects[j].id) {
                                nw = j;
                                break;
                            }
                        }
                        if (nw == -1) {
                            var fileAdds;
                            if (contentData[i].file_link != null){
                                fileAdds = [[contentData[i].file_name,contentData[i].file_link]];
                            } else {
                                fileAdds = [] ;
                            }
                            let sc = new Section(contentData[i].section_id,contentData[i].section_name,contentData[i].article_text,0,fileAdds);
                            sects.push(sc);
                        }
                        else {
                            sects[nw].files.push([contentData[i].file_name,contentData[i].file_link]);
                        }
                    }
                    return res.status(200).send(JSON.stringify(sects));
                }).finally(() => {
                    connection.end();
                });
                
            } else {
                res.status(403).send(err);
            }
        });
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
        return false;
    }

});

module.exports = router;