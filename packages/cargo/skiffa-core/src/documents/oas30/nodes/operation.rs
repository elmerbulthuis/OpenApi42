use super::*;

use std::collections::BTreeMap;

#[derive(Clone)]
pub struct Operation(serde_json::Value);

impl Operation {
  pub fn name(&self) -> Option<&str> {
    self.0.as_object()?.get("operationId")?.as_str()
  }

  pub fn summary(&self) -> Option<&str> {
    self.0.as_object()?.get("summary")?.as_str()
  }

  pub fn description(&self) -> Option<&str> {
    self.0.as_object()?.get("description")?.as_str()
  }

  pub fn deprecated(&self) -> Option<bool> {
    self.0.as_object()?.get("deprecated")?.as_bool()
  }

  pub fn request_parameters(
    &self,
  ) -> Option<BTreeMap<Vec<String>, NodeOrReference<RequestParameter>>> {
    let member = "parameters";
    Some(
      self
        .0
        .as_object()?
        .get(member)?
        .as_array()?
        .iter()
        .enumerate()
        .map(|(key, node)| {
          (
            vec![member.to_owned(), key.to_string()],
            node.clone().into(),
          )
        })
        .collect(),
    )
  }

  pub fn bodies(&self) -> Option<BTreeMap<Vec<String>, Body>> {
    let member = "requestBody";
    let member_1 = "content";
    Some(
      self
        .0
        .as_object()?
        .get(member)?
        .as_object()?
        .get(member_1)?
        .as_object()?
        .into_iter()
        .map(|(key, node)| {
          (
            vec![member.to_owned(), member_1.to_owned(), key.clone()],
            node.clone().into(),
          )
        })
        .collect(),
    )
  }

  pub fn operation_results(
    &self,
  ) -> Option<BTreeMap<Vec<String>, NodeOrReference<OperationResult>>> {
    let member = "responses";
    Some(
      self
        .0
        .as_object()?
        .get(member)?
        .as_object()?
        .into_iter()
        .map(|(key, node)| (vec![member.to_owned(), key.clone()], node.clone().into()))
        .collect(),
    )
  }

  pub fn security(&self) -> Option<Vec<BTreeMap<String, Vec<String>>>> {
    let member = "security";
    Some(
      self
        .0
        .as_object()?
        .get(member)?
        .as_array()?
        .iter()
        .filter_map(|value| {
          Some(
            value
              .as_object()?
              .iter()
              .filter_map(|(key, value)| {
                Some((
                  key.to_owned(),
                  value
                    .as_array()?
                    .iter()
                    .filter_map(|value| Some(value.as_str()?.to_owned()))
                    .collect(),
                ))
              })
              .collect(),
          )
        })
        .collect(),
    )
  }
}

impl From<serde_json::Value> for Operation {
  fn from(value: serde_json::Value) -> Self {
    Self(value)
  }
}
