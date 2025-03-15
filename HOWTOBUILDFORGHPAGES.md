### Compiles and minifies for production

```
npm run build
```

### Add distribution folder changes to the staging area

```
git add dist -f
```

### Commit the new production with commit message

```
git commit -m "commit message"
```

### Finally, push it to the sub-branch gh-pages

```
git subtree push --prefix dist origin gh-pages
```

### All together

```
npm run build
git add dist -f
git commit -m "changed how the taskbar looks to look cohesive with the brushsettings bar, and made the canvas be smaller on screens with different viewport sizes"
git subtree push --prefix dist origin gh-pages
```
