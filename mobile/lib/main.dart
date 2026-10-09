import 'package:flutter/material.dart';

import 'src/app/freshmarket_app.dart';
import 'src/core/config/app_environment.dart';

void main() {
  // Fail fast : une configuration release invalide doit interrompre le
  // demarrage, pas se reveler sur le premier ecran qui appelle l API.
  AppEnvironment.validate();
  runApp(const FreshMarketApp());
}

