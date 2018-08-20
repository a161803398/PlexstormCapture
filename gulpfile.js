const gulp = require('gulp');
const concat = require('gulp-concat');
const minifyCSS = require('gulp-minify-css');
const uglify = require('gulp-uglify');
const rename = require("gulp-rename");
const htmlreplace = require('gulp-html-replace');
const minifyHTML = require('gulp-minify-html');
const PluginError = require('plugin-error');
const runSequence = require('run-sequence');
const del = require('del');
const fs = require('fs');
const rcedit = require('rcedit')
const install = require("gulp-install");
const childProcess = require('child_process');
  
gulp.task('clean', ()=>{
    return del.sync(['dist']);
});
    
gulp.task('copy-data', ()=>{    
    gulp.src('nwjs/**/*').pipe(gulp.dest('dist/bin'));    
    gulp.src('src/www/**/*').pipe(gulp.dest('dist/bin/www'));   
});

gulp.task('install-modules', ()=>{    
    gulp.src(['src/package.json', 'src/package-lock.json'])
    .pipe(gulp.dest('dist/bin').on('end', ()=> { 
        gulp.src(['dist/bin/package.json', 'dist/bin/package-lock.json']).pipe(install({production: true}));
    }));
});

gulp.task('install-newest-modules', ()=>{    
    gulp.src('src/package.json') //no lock
    .pipe(gulp.dest('dist/bin').on('end', ()=> { 
        gulp.src('dist/bin/package.json').pipe(install({production: true}));
    }));
});

gulp.task('wrapper', ()=>{
    copyTask = gulp.src('wrapper/nwStart.exe')
    .pipe(gulp.dest('dist')).on('end', ()=> { 
        const packageInfo = JSON.parse(fs.readFileSync('src/package.json', 'utf8'));
        
        const iconPath = 'wrapper/icon.ico';
        const toSetInfo = {'version-string':{}};
          
        if(fs.existsSync(iconPath)){            
            toSetInfo['icon']= iconPath;
        }  
        
        if(packageInfo.version){            
            toSetInfo['file-version'] = packageInfo.version;
            toSetInfo['product-version'] = packageInfo.version;
        } 
        
        if(packageInfo.name){            
            toSetInfo['version-string']['ProductName'] = packageInfo.name;
        } 

        if(packageInfo.author){            
            toSetInfo['version-string']['LegalCopyright'] = packageInfo.author;
        } 
        
        if(packageInfo.description){            
            toSetInfo['version-string']['FileDescription'] = packageInfo.description;
        } 

        rcedit('dist/nwStart.exe', toSetInfo, (e)=>{
            if(e != null) console.log(e);
        });        
    });
    

});

gulp.task('copy-popup', ()=>{
    gulp.src('popup/**/*').pipe(gulp.dest('dist/popup'));
});
    
const noNwjsSdkError = new PluginError('Missing nw.js sdk files', 'Please download the sdk version nw.js from https://nwjs.io/ and unzip it to nwjs-sdk folder!!');
gulp.task('run-dev', ()=>{
    if(fs.existsSync('nwjs-sdk/nw.exe')){   
        gulp.src('src/*.*').pipe(install({},()=> { 
            const child = childProcess.spawn(
                'nwjs-sdk/nw.exe',
                ["src"], {
                detached: true,
                stdio: 'ignore'
            });
            child.unref();        
        })); 
    }else{
       throw noNwjsSdkError;
    }  
});
    
const noNwjsError = new PluginError('Missing nw.js binary files', 'Please download normal version nw.js from https://nwjs.io/ and unzip it to nwjs folder!!');
    
gulp.task('default', ()=>{
    if(fs.existsSync('nwjs/nw.exe')){       
        runSequence('clean', ['copy-data', 'wrapper', 'install-modules', 'copy-popup']);  
    }else{
        throw noNwjsError;
    }    
});