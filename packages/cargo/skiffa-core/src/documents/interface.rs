use super::DocumentError;
use crate::models;
use crate::utils::NodeLocation;
use std::rc;

pub trait DocumentInterface {
  fn get_default_schema_id(&self) -> String;
  fn get_document_location(&self) -> NodeLocation;
  fn get_schema_locations(&self) -> Result<Vec<NodeLocation>, DocumentError>;
  fn get_referenced_locations(&self) -> Result<Vec<NodeLocation>, DocumentError>;
  fn get_api_model(&self) -> Result<rc::Rc<models::Api>, DocumentError>;
}

pub struct DocumentConfiguration {
  pub retrieval_location: NodeLocation,
}

pub type DocumentFactory = Box<dyn Fn(DocumentConfiguration) -> Box<dyn DocumentInterface>>;
