// (c) Jocopa3 2017
// (c) iTechieGamer 2018

WScript.Echo('Make sure that this script is running in command prompt!\nIf not, then terminate the "wscript.exe" process.');

var WShell = new ActiveXObject('WScript.Shell'), fsObject = new ActiveXObject('Scripting.FileSystemObject'),
    currentDir = fsObject.GetParentFolderName(fsObject.GetFile(WScript.ScriptFullName)), urlFile = currentDir;
var updateFiles = true, verbose = false;

var jsonLib = fsObject.OpenTextFile(currentDir + '\\lib\\json2.js', 1);
eval(jsonLib.ReadAll());
jsonLib.Close();

WScript.Echo();

if(WScript.Arguments.length > 0) urlFile += '\\' + WScript.Arguments(0) + '.txt';
else urlFile += '\\Blocks.txt';

function updater() {
  var output = '', xmlHttp = new ActiveXObject('MSXML2.XMLHTTP');
  xmlHttp.onreadystatechange = function() {
    if(xmlHttp.readyState == 4) {
      var json = JSON.parse(xmlHttp.responseText), cm = json.query.categorymembers;
      for(var a in cm) {  
        if(cm[a].ns == 6) {
          var title = cm[a].title.split(':')[1];
          if(!title.match('.gif'))
            output += 'https://minecraft.gamepedia.com/Special:Redirect/file/' + title + '\n';
        }
      }
      if(json['continue']) {
        xmlHttp.open('GET', 'https://minecraft.gamepedia.com/api.php?action=query&formatversion=2&format=json&list=categorymembers&cmtitle=Category:Block_icons&cmlimit=500&cmcontinue=' + json['continue'].cmcontinue, false);
        xmlHttp.send();
      }
      else {
        var adodbStream = new ActiveXObject('ADODB.Stream');
        adodbStream.Type = 2;
        adodbStream.CharSet = 'Windows-1252';
        adodbStream.Open();
        adodbStream.WriteText(output);
        adodbStream.SaveToFile(urlFile, 2);
        adodbStream.Close();
        WScript.Echo('Successfully updated ' + urlFile);
      }
    }
  }
  xmlHttp.open('GET', 'https://minecraft.gamepedia.com/api.php?action=query&formatversion=2&format=json&list=categorymembers&cmtitle=Category:Block_icons&cmlimit=500', false);
  xmlHttp.send();
}

if(fsObject.FileExists(urlFile)) {
  if(updateFiles) {
    WScript.Echo('Updating URLs at ' + urlFile + ' from https://minecraft.gamepedia.com/Category:Block_icons"');
    updater();
  }
}
else {
  WScript.Echo('Downloading URLs from https://minecraft.gamepedia.com/Category:Block_icons" to ' + urlFile);
  updater();
}

WScript.Echo();

var destinationDir = currentDir + '\\' + fsObject.GetFileName(fsObject.GetFile(urlFile)).split('.')[0].toLowerCase() + '\\';
if(!fsObject.FolderExists(destinationDir))
	fsObject.CreateFolder(destinationDir);

var urls = [], urlFile = fsObject.OpenTextFile(urlFile, 1), a = 0;
while(!urlFile.AtEndOfStream) {
	urls[a] = urlFile.ReadLine();
	a++;
}
urlFile.Close();
WScript.Echo('Downloading images to folder at ' + destinationDir);
for(a in urls) {
	var xmlHttp = new ActiveXObject('MSXML2.XMLHTTP');
	xmlHttp.onreadystatechange = function() {
    if(xmlHttp.readyState == 4) {
      var saveFileName = urls[a].split('/'), adodbStream = new ActiveXObject('ADODB.Stream');
      saveFileName = destinationDir + saveFileName[(saveFileName.length - 1)];
      if(verbose) WScript.Echo(saveFileName);
      adodbStream.Type = 1;
      adodbStream.Open();
      adodbStream.Write(xmlHttp.responseBody);
      if(fsObject.FileExists(saveFileName) && updateFiles) {
        if(verbose) WScript.Echo('└ Updating file');
        adodbStream.SaveToFile(saveFileName, 2);
      }
      else adodbStream.SaveToFile(saveFileName);
      adodbStream.Close();
    }
  }
  xmlHttp.open('GET', urls[a], false);
  xmlHttp.send();
}