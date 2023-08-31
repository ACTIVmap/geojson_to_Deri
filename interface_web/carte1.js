import {XMLWriter} from './XMLWriter.js';


document.getElementById("E1").onclick = debut1;



function debut1(e) {
  
  let size_tablet_0_value = document.getElementById("size_tablet_0").value;
  let size_tablet_1_value = document.getElementById("size_tablet_1").value;
  let size_interactor_value = document.getElementById("size_interactor").value;
  let title_export_value = document.getElementById("title_export").value;
  let image_value = document.getElementById("image").files["0"];
  let size_map_0_value = document.getElementById("size_map_0").value;
  let size_map_1_value = document.getElementById("size_map_1").value;
  let lower_right_0_value = document.getElementById("lower_right_0").value;
  let lower_right_1_value = document.getElementById("lower_right_1").value;


  let location_interactor_value=[] 
  for(let k =0; k<document.getElementById('location_interactor').files.length; k++){
    location_interactor_value.push(document.getElementById("location_interactor").files[k])
  }
  let coord_file_value = document.getElementById("coord_file").files["0"];
  let template_interactor_file_value = document.getElementById("template_interactor_file").files["0"];





  let argument_margin_norm = [(lower_right_0_value-size_map_0_value)/size_tablet_0_value,(lower_right_1_value-size_map_1_value)/size_tablet_1_value,(size_tablet_0_value-lower_right_0_value)/size_tablet_0_value,(size_tablet_1_value-lower_right_1_value)/size_tablet_1_value]
  let width = size_interactor_value/size_tablet_0_value.toString()
  let height = size_interactor_value/size_tablet_1_value.toString()
  var layer = "layer_01";
  


  var interactor_list = [];
  for(let k =0; k<location_interactor_value.length; k++){
    var reader = new FileReader();
  
    reader.onload = function(evt) {
  
        let v = evt.target.result;
        interactor_list.push(JSON.parse(v))
      };
    
    reader.readAsText(location_interactor_value[k]);
  
  }


  var box_map= [];
  var coord_file;
  if(coord_file_value!= null){
    var reader = new FileReader();
  
    reader.onload = function(evt) {
  
        let v = evt.target.result;
        coord_file =JSON.parse(v)
        box_map =[
          coord_file['features'][0]["geometry"]["coordinates"][0][2][0],
          coord_file['features'][0]["geometry"]["coordinates"][0][0][1],
          coord_file['features'][0]["geometry"]["coordinates"][0][0][0],
          coord_file['features'][0]["geometry"]["coordinates"][0][2][1]
        ];
      };
    reader.readAsText(coord_file_value);

    

  }


  var template_interactor;
  if(template_interactor_file_value !=null){
    var reader = new FileReader();
  
    reader.onload = function(evt) {
  
        let v = evt.target.result;
        template_interactor =JSON.parse(v)
      };
    reader.readAsText(template_interactor_file_value);


  }

  setTimeout(async () =>{

    //remplissage
    var count =1;
    var poi_list =[];
    var text_list =[];
    var trigger_list =[];


    for(let t =0; t<interactor_list.length; t++){
      for(let k =0; k<interactor_list[t]['features'].length; k++){
        
        let numero;
        if (count.toString().length ==2){
          numero = "0"+ count.toString();
        }else if(count.toString().length ==1){
          numero = "00"+ count.toString();
        }else{
          numero = count.toString;
        }
        let id = 'ellipse'+ numero;
        let name = interactor_list[t]['features'][k]["properties"]["highway"];
        let shape ="ELLIPSE";
        let x;
        let y;
        if ("image_coord_norm" in interactor_list[t]['features'][k]["properties"]){

          x = parseFloat(interactor_list[t]['features'][k]["properties"]["image_coord_norm"].split(',')[0])-parseFloat(width)/2;
          y = parseFloat(interactor_list[t]['features'][k]["properties"]["image_coord_norm"].split(',')[1])-parseFloat(height)/2;
        }else{
          if (coord_file_value != null){

            let x_coord = interactor_list[t]['features'][k]['geometry']["coordinates"][0];
            let y_coord = interactor_list[t]['features'][k]['geometry']["coordinates"][1];
  
            let x_norm_coord = (x_coord-box_map[0])/(box_map[2]-box_map[0]);
            let y_norm_coord =1-(y_coord-box_map[1])/(box_map[3]-box_map[1]);
  
            let x_norm = argument_margin_norm[0] + (1-(argument_margin_norm[0]+argument_margin_norm[2]))*x_norm_coord;
            let y_norm = argument_margin_norm[1] + (1-(argument_margin_norm[1]+argument_margin_norm[3]))*y_norm_coord;
            x = x_norm -parseFloat(width)/2;
            y = y_norm-parseFloat(height)/2;
          }else{
              x=0;
              y=0;
          }
        }
        let id_text = "res_" + count.toString();
        let description;
        if ("description" in interactor_list[t]['features'][k]["properties"]){
          description = interactor_list[t]['features'][k]["properties"]["description"];
          
        }else{
          description =" ";
        }
        let event ="DOUBLE_TAP";
        count+=1 ;
        poi_list.push([id,name,shape,x,y,width,height]);
        text_list.push([id_text,description]);
        trigger_list.push([id,"tts",event,"PLAY_TEXT",id_text,layer]);
      }
    }
    if (template_interactor_file_value != null){
      for(let k =0; k<Object.keys(template_interactor).length; k++){ 
        let numero;
        if (count.toString().length ==2){
          numero = "0"+ count.toString();
        }else if(count.toString().length ==1){
          numero = "00"+ count.toString();
        }else{
          numero = count.toString;
        }
        let id = 'ellipse'+numero;
        let name = template_interactor[k.toString()]["template_item"];
        let shape ="ELLIPSE";
        let event ="DOUBLE_TAP";
          
        let x = template_interactor[k.toString()]["image_coord_norm"][0]-parseFloat(width)/2;
        let y = template_interactor[k.toString()]["image_coord_norm"][1]-parseFloat(height)/2;
        let id_text = 'res_'+numero;

        let description = template_interactor[k.toString()]["legend_link"];
        if(description ==""){
          description = " "
        }
        poi_list.push([id,name,shape,x,y,width,height]);
        text_list.push([id_text,description]);
        trigger_list.push([id,"tts",event,"PLAY_TEXT",id_text,layer]);
        count+=1;
      }
    }
    var xml_content = ""
  
    xml_content += "<?xml version='1.0' encoding='UTF-8'?>" +"\n";
    xml_content += "<TangibleBoxApp xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:noNamespaceSchemaLocation='tba.xsd'>" +"\n";
    xml_content +='<Infos id="1" title="'+ title_export_value +'" platform="DERI"/>' +"\n";
    xml_content +=  '<GameBoard width="-1" height="-1" src="'+image_value.name+'">' +"\n";
    for(let k =0; k<poi_list.length; k++){
      
      xml_content += '<Poi id="'+poi_list[k][0]+'"'+
       ' name="'+ poi_list[k][1] +'"'+
       ' shape="'+ poi_list[k][2] +'"'+
       ' x="'+ poi_list[k][3] +'"'+
       ' y="'+ poi_list[k][4] +'"'+
       ' width="'+ poi_list[k][5] + '"'+
       ' height="'+ poi_list[k][6] +'"'+'/>' +"\n"
  
    }
    xml_content += '</GameBoard>' +"\n";
    xml_content += '<Layers>' +"\n";
    xml_content +='<Layer id="action" label="Actions" enabled="true"/>' +"\n";
    xml_content += '<Layer id="layer_01" label="01" enabled="true"/>' +"\n";
    xml_content += '</Layers>' +"\n";
    xml_content += '<Resources>' +"\n";
  
  
   for(let t =0; t<text_list.length; t++){
      xml_content += '<Text id="'+text_list[t][0]+'"'+
      ' string="'+ text_list[t][1] +'"'+'/>' +"\n"
    }
  
    xml_content += '</Resources>' +"\n";
    xml_content += '<Behavior>' +"\n";
    for(let k =0; k<trigger_list.length; k++){
      xml_content += '<Trigger origin="'+trigger_list[k][0]+'"'+
      ' destination="'+ trigger_list[k][1] +'"'+
      ' event="'+ trigger_list[k][2] +'"'+
      ' action="'+ trigger_list[k][3] +'"'+
      ' res="'+ trigger_list[k][4] +'"'+
      ' layer="'+ trigger_list[k][5] +'"'+'/>' +"\n"
    }
    xml_content += '</Behavior>' +"\n";
    xml_content += '</TangibleBoxApp>' +"\n";





  let blob_xml = new Blob([ xml_content ], { type: "text/xml" });  


  const formdata = new FormData();
  formdata.append('imageFile', image_value);
  formdata.append('xmlFile',blob_xml,'behavior.xml');


  console.log(formdata.get('xmlFile'))


  fetch('/upload', {
    method: "POST",
    // headers: {
    //   'Content-Type': 'application/x-www-form-urlencoded',
    // },
    body: formdata,
    }).then(res=>res.blob())
    .then(zipBlob => {
      // Créer un objet URL pour le Blob
      const zipUrl = URL.createObjectURL(zipBlob);

      // Créer un lien de téléchargement pour le fichier ZIP
      const downloadLink = document.createElement('a');
      downloadLink.href = zipUrl;
      downloadLink.download = 'output.deri';
      document.body.appendChild(downloadLink);
      downloadLink.click()
      downloadLink.remove()
      URL.revokeObjectURL(zipUrl);
  })
  .catch(error => {
      console.error('Une erreur s\'est produite :', error);
  });


  },1000)





}




 
function ecriture_xml(){
  var xml_content = new XMLWriter()
  
  xml_content.BeginNode("TangibleBoxApp");
  xml_content.Attrib("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
  xml_content.Attrib("xsi:noNamespaceSchemaLocation", "tba.xsd");
  xml_content.BeginNode("Infos")
  xml_content.Attrib("id", "1");
  xml_content.Attrib("title", title_export_value);
  xml_content.Attrib("platform", "DERI");
  xml_content.EndNode()
  xml_content.BeginNode("GameBoard")
  xml_content.Attrib("width", "-1");
  xml_content.Attrib("height", "-1");
  xml_content.Attrib("src", image_value);
  for(let k =0; k<poi_list.length; k++){
    xml_content.BeginNode("Poi")
    xml_content.Attrib("id", poi_list[k][0]);
    xml_content.Attrib("name", poi_list[k][1]);
    xml_content.Attrib("shape",poi_list[k][2]);
    xml_content.Attrib("x",poi_list[k][3]);
    xml_content.Attrib("y",poi_list[k][4]);
    xml_content.Attrib("width",poi_list[k][5]);
    xml_content.Attrib("height", poi_list[k][6]);
    xml_content.EndNode()
  }
// gameboard
  xml_content.EndNode()

  xml_content.BeginNode("Layers")
  xml_content.BeginNode("layer")
  xml_content.Attrib("id","action");
  xml_content.Attrib("label","Actions");
  xml_content.Attrib("enabled","true");
  xml_content.EndNode()
  xml_content.BeginNode("layer")
  xml_content.Attrib("id","layer_01");
  xml_content.Attrib("label","01");
  xml_content.Attrib("enabled","true");
  xml_content.EndNode();
  // Layers
  xml_content.EndNode();

  xml_content.BeginNode("Resources")
  for(let k =0; k<text_list.length; k++){

    xml_content.BeginNode("Text")
    xml_content.Attrib("id", text_list[k][0]);
    xml_content.Attrib("string", text_list[k][1]);
    xml_content.EndNode()
  }
//Ressource
  xml_content.EndNode();

  xml_content.BeginNode("Behavior")
  for(let k =0; k<trigger_list.length; k++){
    xml_content.BeginNode("Trigger")
    xml_content.Attrib("origin", trigger_list[k][0]);
    xml_content.Attrib("destination", trigger_list[k][1]);
    xml_content.Attrib("event",trigger_list[k][2]);
    xml_content.Attrib("action",trigger_list[k][3]);
    xml_content.Attrib("res",trigger_list[k][4]);
    xml_content.Attrib("layer",trigger_list[k][5]);
    xml_content.EndNode()
  }
//Behavior
  xml_content.EndNode();

//TangibleBoxApp
  xml_content.EndNode();
  
  console.log(xml_content)
xml_content.Close()
}

function fin(data_export){
  // ecrire xml, téléchargemeent
  // let csvContent = "data:text/csv;charset=utf-8," +"time,etape\n"
  //   + tab.map(e => e.join(",")).join("\n");
  var encodedUri = encodeURI(data_export);

  var a = document.createElement('a');
  a.download = "test.txt";
  a.href = encodedUri;
  document.body.appendChild(a);
  a.click();
  
//   var link = document.createElement("a");
//   link.setAttribute("href", encodedUri);
//   let nom = "behavior.xml"
//   link.setAttribute("download", nom);
//   document.body.appendChild(link); 
//   link.click();
}    
