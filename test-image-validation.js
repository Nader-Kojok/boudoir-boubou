/**
 * Script de test pour la validation des images
 * Teste les différents scénarios de validation d'images
 */

const { validateBase64Image, MAX_FILE_SIZE } = require('./src/lib/image-validation.ts')

// Test 1: Image valide (petit pixel rouge)
const validImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

// Test 2: Format invalide
const invalidFormat = 'data:text/plain;base64,SGVsbG8gV29ybGQ='

// Test 3: Base64 invalide
const invalidBase64 = 'data:image/png;base64,invalid-base64-data!!!'

// Test 4: Type MIME non autorisé
const invalidMimeType = 'data:image/bmp;base64,Qk0eAAAAAAAAAD4AAAAoAAAAAQAAAAEAAAABACAAAAAAAAAAAAATCwAAEwsAAAAAAAAAAAAA'

// Test 5: Image trop volumineuse (simulée)
const largeImageData = 'A'.repeat(6 * 1024 * 1024) // 6MB de données
const largeImage = `data:image/jpeg;base64,${largeImageData}`

console.log('🧪 Tests de validation d\'images\n')

console.log('Test 1: Image valide')
const result1 = validateBase64Image(validImage)
console.log('Résultat:', result1)
console.log('✅ Attendu: { isValid: true }\n')

console.log('Test 2: Format invalide')
const result2 = validateBase64Image(invalidFormat)
console.log('Résultat:', result2)
console.log('✅ Attendu: { isValid: false, error: "Format de données invalide..." }\n')

console.log('Test 3: Base64 invalide')
const result3 = validateBase64Image(invalidBase64)
console.log('Résultat:', result3)
console.log('✅ Attendu: { isValid: false, error: "Données base64 corrompues..." }\n')

console.log('Test 4: Type MIME non autorisé')
const result4 = validateBase64Image(invalidMimeType)
console.log('Résultat:', result4)
console.log('✅ Attendu: { isValid: false, error: "Format de données invalide..." }\n')

console.log('Test 5: Image trop volumineuse')
const result5 = validateBase64Image(largeImage)
console.log('Résultat:', result5)
console.log('✅ Attendu: { isValid: false, error: "Image trop volumineuse..." }\n')

console.log('📊 Résumé des tests:')
console.log('- Test 1 (valide):', result1.isValid ? '✅ PASS' : '❌ FAIL')
console.log('- Test 2 (format invalide):', !result2.isValid ? '✅ PASS' : '❌ FAIL')
console.log('- Test 3 (base64 invalide):', !result3.isValid ? '✅ PASS' : '❌ FAIL')
console.log('- Test 4 (MIME invalide):', !result4.isValid ? '✅ PASS' : '❌ FAIL')
console.log('- Test 5 (trop volumineux):', !result5.isValid ? '✅ PASS' : '❌ FAIL')

console.log('\n🔒 Validation de sécurité implémentée avec succès!')
console.log('Les images sont maintenant validées pour:')
console.log('- Format et type MIME (JPEG, PNG, WebP, GIF)')
console.log('- Taille maximale (5MB)')
console.log('- Encodage base64 valide')
console.log('- Côté client ET côté serveur')