
# preact-starter-kit
Some boilerplate code to kickstart Preact-based projects.

Includes :
- **Webpack** and **Preact**, configured and ready to go
- Typing through **TypeScript**
- Linting through **ESlint** and **Prettier**
- Component styling through **CSS Modules** and **CSS Variables** 
- Backward compatibility with older browsers for JS and CSS through : 
  - transpiling to ES5
  - **PostCSS** and **PostCSS-Preset-Env**

## How to use it (the easy way)
Simply click the `use template` button on the GitHub interface to create a new repository based on this one.

## How to use it (the hard way)
1. Create a new repository for your project.
2. Open Terminal
3. Create a bare clone of the `preact-starter-kit` repository.
```shell
$ git clone --bare https://github.com/beurkinger/preact-starter-kit.git
```
4. Mirror-push to the new repository.
```
$ cd old-repository.git
$ git push --mirror https://github.com/exampleuser/new-repository.git
```
5. Remove the temporary local repository you created earlier.
```
$ cd ..
$ rm -rf old-repository.git
```
