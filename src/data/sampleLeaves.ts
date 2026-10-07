export interface SampleLeaf {
  id: string;
  name: string;
  crop: string;
  diseaseHint: string;
  dataUrl: string;
}

export const SAMPLE_LEAVES: SampleLeaf[] = [
  {
    id: 'sample_rice_blight',
    name: 'Rice Bacterial Blight',
    crop: 'Paddy Rice (Oryza sativa)',
    diseaseHint: 'Marginal wilting & necrotic lesions',
    dataUrl: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sample_tomato_blight',
    name: 'Tomato Early Blight',
    crop: 'Tomato (Solanum lycopersicum)',
    diseaseHint: 'Concentric brown rings & yellow halos',
    dataUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sample_wheat_rust',
    name: 'Wheat Yellow Stripe Rust',
    crop: 'Wheat (Triticum aestivum)',
    diseaseHint: 'Linear rows of yellow-orange pustules',
    dataUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sample_citrus_canker',
    name: 'Citrus Bacterial Canker',
    crop: 'Citrus / Lemon (Citrus limon)',
    diseaseHint: 'Raised corky spots with chlorotic halo',
    dataUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sample_cotton_curl',
    name: 'Cotton Leaf Curl Virus',
    crop: 'Cotton (Gossypium hirsutum)',
    diseaseHint: 'Upward curling & vein thickening',
    dataUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sample_healthy_farmland',
    name: 'Healthy Organic Crop Foliage',
    crop: 'Capsicum & Mixed Veg',
    diseaseHint: 'Vibrant green foliage, zero lesions',
    dataUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
  }
];
