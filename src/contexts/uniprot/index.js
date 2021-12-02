import React from 'react';
import UniprotServiceFactory from '../../tools/uniprot/Uniprot';

const DefaultUniprot = new UniprotServiceFactory({});
const UniprotContext = React.createContext(DefaultUniprot);

export default UniprotContext;