
### Compiles and minifies for production
```
npm run build
```

### Move into outside 
```
cd ..
```

### Add distribution folder changes to the staging area
```
git add frontend/dist -f
```

### Commit the new production with commit message
```
git commit -m "commit message"
```

### Finally, push it to the sub-branch gh-pages
```
git subtree push --prefix frontend/dist origin gh-pages
```

