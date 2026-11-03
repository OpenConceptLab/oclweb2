/* global globalThis */
import test from 'node:test'
import assert from 'node:assert/strict'

import { getEnv, toAppOrigin } from '../env.js'

const envAt = origin => {
  globalThis.window = {location: {origin}}
  return [getEnv(), getEnv(true)]
}

test('app.openconceptlab.org is production', () => {
  assert.deepEqual(envAt('https://app.openconceptlab.org'), ['production', ''])
})

test('app.<env>.openconceptlab.org is that environment', () => {
  assert.deepEqual(envAt('https://app.staging.openconceptlab.org'), ['staging', 'staging'])
  assert.deepEqual(envAt('https://app.qa.openconceptlab.org'), ['qa', 'qa'])
  assert.deepEqual(envAt('https://app.demo.openconceptlab.org'), ['demo', 'demo'])
  assert.deepEqual(envAt('https://app.dev.openconceptlab.org'), ['dev', 'dev'])
  assert.deepEqual(envAt('https://app.staging.who.openconceptlab.org'), ['staging-who', 'staging.who'])
})

test('app.v2.openconceptlab.org, where TBv2 stays once TBv3 is the default Term Browser, is production', () => {
  assert.deepEqual(envAt('https://app.v2.openconceptlab.org'), ['production', ''])
})

test('app.v2.<env>.openconceptlab.org is that environment', () => {
  assert.deepEqual(envAt('https://app.v2.staging.openconceptlab.org'), ['staging', 'staging'])
  assert.deepEqual(envAt('https://app.v2.qa.openconceptlab.org'), ['qa', 'qa'])
  assert.deepEqual(envAt('https://app.v2.demo.openconceptlab.org'), ['demo', 'demo'])
  assert.deepEqual(envAt('https://app.v2.dev.openconceptlab.org'), ['dev', 'dev'])
})

test('any other host is development', () => {
  assert.deepEqual(envAt('http://localhost:4000'), ['development', 'development'])
})

test('toAppOrigin maps app.v2.<env> to app.<env> and leaves other origins alone', () => {
  assert.equal(toAppOrigin('https://app.v2.openconceptlab.org'), 'https://app.openconceptlab.org')
  assert.equal(toAppOrigin('https://app.v2.staging.openconceptlab.org'), 'https://app.staging.openconceptlab.org')
  assert.equal(toAppOrigin('https://app.qa.openconceptlab.org'), 'https://app.qa.openconceptlab.org')
  assert.equal(toAppOrigin('http://localhost:4000'), 'http://localhost:4000')
})
