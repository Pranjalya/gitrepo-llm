git checkout --orphan gh-pages
cd github-to-markdown
npm install
npm run build
git --work-tree build add --all
git --work-tree build commit -m 'deployed :wrench:'
git push origin HEAD:gh-pages --force
rm -r buildcd sr
git checkout -f main
git branch -D gh-pages