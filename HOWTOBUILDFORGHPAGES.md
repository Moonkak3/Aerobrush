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
git commit -m "fixed bug where canvas drawing size is much smaller than background size when scaled down (esp for mobile) part2"
git subtree push --prefix dist origin gh-pages

```
