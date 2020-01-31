const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

/*returns a list of all sections ordered by the position variable*/

class SecFile {
    constructor(id = 0, title = '', path = '') {
        this.id = id;
        this.title = title;
        this.path = path;
    }

}

class Section { //this is the class for an app section or page
    constructor(id = 0, name = '', text = 'No text added', position = 0, files = []) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.position = position;
        this.files = files;
    }
}

function compare(a, b) {
    if (a.position < b.position) {
        return -1;
    }
    if (a.position > b.position) {
        return 1;
    }
    return 0;
}

router.get('/', (req, res) => {
    try {
        jwt.verify(req.query.token, process.env.TOKEN_USER, (err) => {
            if (err) return res.status(403);

            let sec_id = parseInt(req.query.sec_id, 10) || 'All';
            const connection = mysql.createConnection({
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE
            });

            connection.connect((err) => {
                if (err) throw err;
            });
            var whereString = '';
            if (sec_id !== 'All') {
                whereString = `WHERE sections.section_id = ${sec_id}`;
            }

            function getList() {
                return new Promise((resolve, reject) => {
                    connection.query(`SELECT sections.section_id, sections.article_text, sections.section_name, sections.position, files.file_id, files.file_name, files.file_link FROM sections
                                            LEFT JOIN files ON sections.section_id = files.section_id ${whereString}
                                            `, [], (err, results) => {
                        if (err) throw res.sendStatus(400);
                        resolve(results);
                    });
                });
            }

            getList().then(result => {
                let contentData = result;
                let sects = [];

                for (let i = 0; i < contentData.length; i++) {

                    let nw = -1;
                    for (let j = 0; j < sects.length; j++) {

                        if (contentData[i].section_id == sects[j].id) {
                            nw = j;
                            break;
                        }
                    }

                    if (nw == -1) {
                        var fileAdds;
                        if (contentData[i].file_link != null) {
                            fileAdds = [new SecFile(contentData[i].file_id, contentData[i].file_name, contentData[i].file_link)];
                        } else {
                            fileAdds = [];
                        }
                        let sc = new Section(contentData[i].section_id, contentData[i].section_name, contentData[i].article_text, contentData[i].position, fileAdds);
                        sects.push(sc);
                    } else {
                        sects[nw].files.push(new SecFile(contentData[i].file_id, contentData[i].file_name, contentData[i].file_link));
                    }
                }

                sects.sort(compare);

                return res.status(200).send(sects);

            }).finally(() => {
                connection.end();
            });

        });
    } catch (err) {
        return res.status(500);
    }

});

module.exports = router;