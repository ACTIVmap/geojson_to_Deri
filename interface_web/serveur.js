

const express = require('express')
const multer = require('multer');
const fs = require('fs');
const archiver = require('archiver');

const upload = multer({ dest: 'uploads/' });
const app = express()
const port = 3000



app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/upload', upload.fields([{ name: 'imageFile', maxCount: 1 }, { name: 'xmlFile', maxCount: 1 }]), (req, res) => {

  const imageFile = req.files['imageFile'][0];
  const xmlFile = req.files['xmlFile'][0];
  const name_im = imageFile.originalname;
  const name_xml = xmlFile.originalname;


  const outputZip = fs.createWriteStream('archive.zip');
  const archive = archiver('zip', {
    zlib: { level: 9 } // Niveau de compression (0-9), 9 étant le plus élevé
  });
  archive.pipe(outputZip);
  archive.directory('format_deri/', './');
  archive.file(imageFile.path, { name: `format_deri/${name_im}` });
  archive.file(xmlFile.path, { name: `format_deri/${name_xml}` });
  archive.directory('res/', 'format_deri/res');

  archive.finalize();


  archive.on('finish', () => {
    outputZip.end(); // Fermer le flux de sortie du fichier ZIP
  });

  outputZip.on('close', () => {
    res.download('archive.zip', 'output.zip', (err) => {
      if (err) {
        console.error('Une erreur s\'est produite lors de l\'envoi du fichier ZIP :', err);
        res.status(500).send('Erreur lors de l\'envoi du fichier ZIP.');
      }

      // Supprimer le fichier ZIP une fois qu'il a été envoyé au client
      fs.unlink('archive.zip', (err) => {
        if (err) {
          console.error('Une erreur s\'est produite lors de la suppression du fichier ZIP :', err);
        } else {
          console.log('Fichier ZIP supprimé avec succès.');
        }
      });
      fs.unlink(imageFile.path, (err) => {
        if (err) {
            console.error('Une erreur s\'est produite lors de la suppression du fichier image :', err);
        } else {
            console.log('Fichier image supprimé avec succès.');
        }
      });

      fs.unlink(xmlFile.path, (err) => {
        if (err) {
            console.error('Une erreur s\'est produite lors de la suppression du fichier XML :', err);
        } else {
            console.log('Fichier XML supprimé avec succès.');
        }
      });
    });
  });




})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile('./enquete.html');
})
