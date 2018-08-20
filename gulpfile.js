const gulp = require('gulp');
const concat = require('gulp-concat');
const minifyCSS = require('gulp-minify-css');
const uglify = require('gulp-uglify');
const rename = require("gulp-rename");
const htmlreplace = require('gulp-html-replace');
const minifyHTML = require('gulp-minify-html');
const PluginError = require('plugin-error');
const del = require('del');
const fs = require('fs');
const rcedit = require('rcedit')
const install = require("gulp-install");
const childProcess = require('child_process');
  
gulp.task('clean', ()=>{
    return del(['dist']);
});
    
gulp.task('copy-data', (done)=>{  
    if(fs.existsSync('nwjs/nw.exe')){       
        gulp.src('nwjs/**/*').pipe(gulp.dest('dist/bin'));    
        gulp.src('src/www/**/*').pipe(gulp.dest('dist/bin/www'));  
        done();
    }else{
        throw noNwjsError;
    }   
});

gulp.task('copy-doc', (done)=>{           
    gulp.src('doc/*').pipe(gulp.dest('dist'));    
    done();  
});

gulp.task('install-modules', (done)=>{    
    gulp.src(['src/package.json', 'src/package-lock.json'])
    .pipe(gulp.dest('dist/bin').on('end', ()=> { 
        gulp.src(['dist/bin/package.json', 'dist/bin/package-lock.json']).pipe(install({production: true}));
    }));
    done();
});

gulp.task('install-newest-modules', ()=>{    
    gulp.src('src/package.json') //no lock
    .pipe(gulp.dest('dist/bin').on('end', ()=> { 
        gulp.src('dist/bin/package.json').pipe(install({production: true}));
    }));
});

gulp.task('wrapper', (done)=>{
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
    done();

});

gulp.task('copy-popup', (done)=>{
    gulp.src('popup/**/*').pipe(gulp.dest('dist/popup'));
    done();
});
    
const noNwjsSdkError = new PluginError('Missing nw.js sdk files', 'Please download the sdk version nw.js from https://nwjs.io/ and unzip it to nwjs-sdk folder!!');

gulp.task('dev-clean', (done)=>{
    return del(['src/node_modules']);
});

gulp.task('run-dev', (done)=>{   
    if(fs.existsSync('nwjs-sdk/nw.exe')){
        function runNW(){
            const child = childProcess.spawn(
                'nwjs-sdk/nw.exe',
                ["src"], {
                detached: true,
                stdio: 'ignore'
            });
            child.unref();   
            done();
        }
        
        if(fs.existsSync('src/node_modules')){
            runNW();            
        }else{
            gulp.src('src/*.*').pipe(install({}, runNW));                         
        }
        
    }else{
       throw noNwjsSdkError;
    }  
});

gulp.task('run-dev-clean', gulp.series('dev-clean', 'run-dev'));
    
const noNwjsError = new PluginError('Missing nw.js binary files', 'Please download normal version nw.js from https://nwjs.io/ and unzip it to nwjs folder!!');

gulp.task('build', gulp.parallel('copy-data', 'wrapper', 'install-modules', 'copy-popup', 'copy-doc'));
gulp.task('default', gulp.series('clean', 'build'));