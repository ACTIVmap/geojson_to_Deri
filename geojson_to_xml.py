import numpy as np
import os
import pandas as pd
import geopandas as gpd
import pandas as pd
from lxml import etree
import glob
import json
import shutil

def gen_xml(size_tablet,size_interactor,location_interactor,title,image,size_map,lower_right ,coord_file = None,template_interactor_file = None):
    """

    Parameters
    ----------

    size_tablet : [float,float] 
        tablet size  [width,height]
    size_interactor : float
        interactor size 
    location_interactor : str
        location of interactor file
    title : str
        title
    image: str
        name on image
    size_map: [int,int]
    lower_right: [int,int]
    coord_file : str
    template_interactor_file : str
    """

    width = str(size_interactor/size_tablet[0])
    height = str(size_interactor/size_tablet[1])

    argument_margin_norm = [(lower_right[0]-size_map[0])/size_tablet[0],(lower_right[1]-size_map[1])/size_tablet[1],(size_tablet[0]-lower_right[0])/size_tablet[0],(size_tablet[1]-lower_right[1])/size_tablet[1]]
    interactor_file_list = glob.glob(location_interactor)
    interactor_list = [] 
    if coord_file!= None:
        info = gpd.read_file(coord_file)
        box_map = info['geometry'][0].bounds
    

    for i in range(len(interactor_file_list)):
        assert os.path.exists(interactor_file_list[i])    
        interactor_list.append(gpd.read_file( interactor_file_list[i]))
    if template_interactor_file != None:
        with open(template_interactor_file, 'r', encoding='utf-8') as f:
            template_interactor = json.load(f)
   
    noNamespaceSchemaLocation = etree.QName("http://www.w3.org/2001/XMLSchema-instance", "noNamespaceSchemaLocation")
    tangibleBoxApp = etree.Element("TangibleBoxApp", {noNamespaceSchemaLocation: "tba.xsd"})


    infos = etree.SubElement(tangibleBoxApp,"Infos")
    infos.set("id","1")
    infos.set("title",title)
    infos.set("platform","DERI")

    gameboards = etree.SubElement(tangibleBoxApp,"GameBoard")
    gameboards.set("width","-1")
    gameboards.set("height","-1")
    gameboards.set("src",image)

    layers = etree.SubElement(tangibleBoxApp,"Layers")

    layer = etree.SubElement(layers,'Layer')
    layer.set("id","action")
    layer.set("label","Actions")
    layer.set("enabled","true")

    layer2 = etree.SubElement(layers,'Layer')
    layer2.set("id","layer_01")
    layer2.set("label","01")
    layer2.set("enabled","true")

    resources =etree.SubElement(tangibleBoxApp,"Resources")

    behavior = etree.SubElement(tangibleBoxApp,"Behavior")

    layer = "layer_01"
    count = 1
    for t in range(len(interactor_list)):
        for k in range(len(interactor_list[t])):        
            poi = etree.SubElement(gameboards,'Poi')
            
            if len(str(count)) ==2:
                numero = "0"+str(count)
            elif len(str(count)) == 1:
                numero = "00"+str(count)
            id = 'ellipse'+numero
            poi.set("id",id)
            name = interactor_list[t]["highway"][k]
            poi.set("name",name)
            shape ="ELLIPSE"
            poi.set("shape",shape)            
            if "image_coord_norm" in interactor_list[t].columns:
                x = float(interactor_list[t]["image_coord_norm"][k].split(',')[0])-float(width)/2
                poi.set("x",str(x))
                y = float(interactor_list[t]["image_coord_norm"][k].split(',')[1])-float(height)/2
                poi.set("y",str(y))
            else:
                # calcul de x et y norm
                if coord_file != None:
                    x_coord = interactor_list[t]['geometry'][k].x
                    y_coord = interactor_list[t]['geometry'][k].y

                    x_norm_coord = (x_coord-box_map[0])/(box_map[2]-box_map[0])
                    y_norm_coord =1-(y_coord-box_map[1])/(box_map[3]-box_map[1])

                    x_norm = argument_margin_norm[0] + (1-(argument_margin_norm[0]+argument_margin_norm[2]))*x_norm_coord
                    y_norm = argument_margin_norm[1] + (1-(argument_margin_norm[1]+argument_margin_norm[3]))*y_norm_coord
                    poi.set("x",str((x_norm -float(width)/2)))
                    poi.set("y",str((y_norm)-float(height)/2))
                else :
                    poi.set("x","0")
                    poi.set("y","0")                    
            poi.set("width",width)
            poi.set("height",height)
            ## second case: several types of interactions for an interactor
            # for p in range(len(interactor_list[t]["descriptions"][k])):
            #     text = etree.SubElement(resources,'Text')
            
            #     id_text = str(t)+"_"+str(k)+"_"+str(p)
            #     description = interactor_list[t]["descriptions"][k]["description"][p]
            #     event = interactor_list[t]["descriptions"][k]["event"][p]
            #     text.set("id",id_text)
            #     text.set("string",description)
            #     trigger = etree.SubElement(behavior,'Trigger')
            #     trigger.set("origine",id)
            #     trigger.set("destination","tts")
            #     trigger.set("event",event)
            #     trigger.set( "action","PLAY_TEXT")
            #     trigger.set("res",id_text)
            #     trigger.set("layer",layer)
            
            text = etree.SubElement(resources,'Text')
            id_text = 'res_'+numero
            if "description" not in interactor_list[t].columns:
                description =""
            else:
                description = interactor_list[t]["description"][k]
            event ="DOUBLE_TAP"
            text.set("id",id_text)
            text.set("string",description)
            trigger = etree.SubElement(behavior,'Trigger')
            trigger.set("origine",id)
            trigger.set("destination","tts")
            trigger.set("event",event)
            trigger.set( "action","PLAY_TEXT")
            trigger.set("res",id_text)
            trigger.set("layer",layer)
            count+=1

    if template_interactor_file != None:
        for k in range(len(template_interactor)):        
            poi = etree.SubElement(gameboards,'Poi')
   
            if len(str(count)) ==2:
                numero = "0"+str(count)
            elif len(str(count)) == 1:
                numero = "00"+str(count)
            id = 'ellipse'+numero
            poi.set("id",id)
            name = template_interactor[str(k)]["template_item"]
            poi.set("name",name)
            shape ="ELLIPSE"
            poi.set("shape",shape)            
            x = template_interactor[str(k)]["image_coord_norm"][0]-float(width)/2
            poi.set("x",str(x))
            y = template_interactor[str(k)]["image_coord_norm"][1]-float(height)/2
            poi.set("y",str(y))
            poi.set("width",width)
            poi.set("height",height)
            text = etree.SubElement(resources,'Text')
            id_text = 'res_'+numero
            description = template_interactor[str(k)]["legend_link"]
            event ="DOUBLE_TAP"
            text.set("id",id_text)
            text.set("string",description)
            trigger = etree.SubElement(behavior,'Trigger')
            trigger.set("origine",id)
            trigger.set("destination","tts")
            trigger.set("event",event)
            trigger.set( "action","PLAY_TEXT")
            trigger.set("res",id_text)
            trigger.set("layer",layer)
            count+=1

    
    tree = etree.ElementTree(tangibleBoxApp)
    tree.write('output/format_deri/behavior.xml', pretty_print=True, xml_declaration=True,   encoding="utf-8")


def compression(name_image):
    
    os.mkdir('output/format_deri/res')
    shutil.copy(name_image,'output/format_deri/')
    shutil.make_archive("test_2","zip",'output')
    os.rename("test_2.zip","test_2.deri")

if __name__ == '__main__':
    os.mkdir('output/format_deri')
    gen_xml([420, 297],5,'input/interactor/*',"titre","A3_off.png",[340, 250],[407, 286],coord_file ="input/extent_A3_off.geojson")
    # gen_xml([217,135],5,'input/interactor/*',"titre","tablet_right.png",[163,102],[211,129],template_interactor_file ="input/A5_tablet_template_interactors_right.json")

    compression("input/A3_off.png")

