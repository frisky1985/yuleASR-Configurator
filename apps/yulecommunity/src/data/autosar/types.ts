export interface AutosarVersion {
  id: string;
  label: string;
  releaseDate: string;
  status: 'active' | 'legacy' | 'deprecated';
}

export interface AutosarParam {
  name: string;
  type: string;
  direction: 'in' | 'out' | 'inout';
  description: string;
  range?: string;
}

export interface ConfigParamRef {
  paramName: string;
  configModule: string;
  path: string;
}

export interface AutosarApi {
  id: string;
  name: string;
  signature: string;
  brief: string;
  description: string;
  params: AutosarParam[];
  returnType: string;
  returnDescription: string;
  moduleId: string;
  layerId: AutosarLayerId;
  version: string;
  example: string;
  exampleDescription?: string;
  seeAlso: string[];
  configParams?: ConfigParamRef[];
  timing?: string;
  status: 'standard' | 'optional' | 'deprecated';
}

export type AutosarLayerId = 'MCAL' | 'ECUAL' | 'Service' | 'RTE_ASW';

export interface AutosarModule {
  id: string;
  name: string;
  layer: AutosarLayerId;
  description: string;
  versionIntroduced: string;
  apis: AutosarApi[];
}

export interface AutosarLayer {
  id: AutosarLayerId;
  name: string;
  modules: AutosarModule[];
}

export interface ApiIndexEntry {
  id: string;
  name: string;
  signature: string;
  moduleId: string;
  layerId: string;
  brief: string;
}
