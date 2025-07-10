#!/bin/bash

echo "📸 Téléchargement des photos factices..."

cd "$(dirname "$0")/.."

rm -rf fakeprofilephotos
mkdir -p fakeprofilephotos

for i in {0..99}; do
  curl -s -o fakeprofilephotos/avatar_men_${i}.jpg https://randomuser.me/api/portraits/men/${i}.jpg
  curl -s -o fakeprofilephotos/avatar_women_${i}.jpg https://randomuser.me/api/portraits/women/${i}.jpg
done

echo "✅ Photos téléchargées dans backend/fakeprofilephotos"
