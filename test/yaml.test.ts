import { describe, test, expect } from 'vitest';
import { yamlToJson, jsonToYaml } from '../src/lib/yaml';

describe('yamlToJson', () => {
  test('types numbers, booleans and null', () => {
    expect(JSON.parse(yamlToJson('name: Ada\nage: 36\nadmin: false\nnote: ~\n'))).toEqual({
      name: 'Ada', age: 36, admin: false, note: null,
    });
  });
  test('quoted leading zeros stay strings', () => {
    expect(JSON.parse(yamlToJson("zip: '02134'"))).toEqual({ zip: '02134' });
  });
  test('several documents become a JSON array', () => {
    expect(JSON.parse(yamlToJson('a: 1\n---\nb: 2\n'))).toEqual([{ a: 1 }, { b: 2 }]);
  });
  test('a single document stays a single value', () => {
    expect(JSON.parse(yamlToJson('- a\n- b\n'))).toEqual(['a', 'b']);
  });
  test('JSON is valid YAML, so a JSON file converts', () => {
    expect(JSON.parse(yamlToJson('{"a": 1}'))).toEqual({ a: 1 });
  });
  test('invalid YAML says so', () => {
    expect(() => yamlToJson('a: [1, 2\nb: }')).toThrow('Not valid YAML');
  });
  test('an empty file says so', () => {
    expect(() => yamlToJson('   \n')).toThrow('empty');
  });
});

describe('jsonToYaml', () => {
  test('writes block YAML with the keys in order', () => {
    expect(jsonToYaml('{"name": "Ada", "age": 36}')).toBe('name: Ada\nage: 36\n');
  });
  test('round trips through yamlToJson', () => {
    const json = '{"a":[1,2],"b":{"c":true},"d":"text"}';
    expect(JSON.parse(yamlToJson(jsonToYaml(json)))).toEqual(JSON.parse(json));
  });
  test('invalid JSON says so', () => {
    expect(() => jsonToYaml('{oops}')).toThrow('Not valid JSON');
  });
});
