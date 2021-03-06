export interface CertificateContractData {
  token_id: string;
  owner_id: string;
  metadata: any;
}

export interface CertificateData {
  id?: string;
  title: string;
  description: string;
  media: string;
  issued_at: number;
  reference?: string;
}

// pub title: Option<String>, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
//     pub description: Option<String>, // free-form description
//     pub media: Option<String>, // URL to associated media, preferably to decentralized, content-addressed storage
//     pub media_hash: Option<Base64VecU8>, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
//     pub copies: Option<u64>, // number of copies of this set of metadata in existence when token was minted.
//     pub issued_at: Option<u64>, // When token was issued or minted, Unix epoch in milliseconds
//     pub expires_at: Option<u64>, // When token expires, Unix epoch in milliseconds
//     pub starts_at: Option<u64>, // When token starts being valid, Unix epoch in milliseconds
//     pub updated_at: Option<u64>, // When token was last updated, Unix epoch in milliseconds
//     pub extra: Option<String>, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
//     pub reference: Option<String>, // URL to an off-chain JSON file with more info.
//     pub reference_hash: Option<Base64VecU8>, // 