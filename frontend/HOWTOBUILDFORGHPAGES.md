
### Compiles and minifies for production (do inside frontend)
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

### All together
```
npm run build
cd ..
git add frontend/dist -f
git commit -m "modified sensitivity of the hand detection, such that the border is more lenient and its easier to reach the edges of the screen"
git subtree push --prefix frontend/dist origin gh-pages
```