const Map<String, String> kOrderStatusLabels = {
  'EN_ATTENTE': 'En attente',
  'CONFIRMEE': 'Confirmee',
  'EN_PREPARATION': 'En preparation',
  'EXPEDIEE': 'Expediee',
  'LIVREE': 'Livree',
  'ANNULEE': 'Annulee',
};

const List<String> kOrderStatusSteps = [
  'EN_ATTENTE',
  'CONFIRMEE',
  'EN_PREPARATION',
  'EXPEDIEE',
  'LIVREE',
];

String orderStatusLabel(String status) => kOrderStatusLabels[status] ?? status;
