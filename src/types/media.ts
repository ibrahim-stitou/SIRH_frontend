export interface Media {
  id: number;
  name: string;
  url: string;
  model_id: number;
  model_type: string;
  uuid: string;
  collection_name: string;
  file_name: string;
  mime_type: string;
  title: string;
  description: string;
  disk: string;
  conversions_disk: string;
  size: number;
  custom_properties: any;
  responsive_images: any;
  order_column: number;
  created_at: string;
  updated_at: string;
  created_by: number;
}