const express = require('express');
const router = express.Router();
const tv = require('../tokenVerify');
const utils = require('../../../utils');

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
        function verify() {
            return new Promise((resolve) => {
                resolve(tv.tokenVerify(req.query.token));
            });
        }
        verify().then((userId) => {
            if (!userId) {
                res.sendStatus(403);
                return;
            }
            let sectionId = parseInt(req.query.sectionId, 10);
            if ( (typeof(sectionId) === 'undefined') || (isNaN(sectionId)) ) {
                sectionId = 'All';
            }

            var whereString = '';
            if (sectionId !== 'All') {
                whereString = `WHERE sections.section_id = ${sectionId}`;
            }

            const queryString = `SELECT sections.section_id, sections.article_text, sections.section_name, sections.position, files.file_id, files.file_name, files.file_link FROM sections
            LEFT JOIN files ON sections.section_id = files.section_id ${whereString}`;
            
            utils.mysql_query(res, queryString, [], (results, res) => {
                let contentData = results;
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

                res.status(200).send(sects);
                utils.log(userId, 'list', 'sections');

            });
        });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }

});

module.exports = router;