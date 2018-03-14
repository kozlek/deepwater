<?php

namespace App\Controller;

use App\Controller\AppController;

/**
 * Api Controller
 */
class ApiController extends AppController {
    
    protected $error_entity_not_found = array('message' => 'Entity ID does not exist.');
    protected $error_wrong_params = array('message' => 'Bad request, check your parameters.');
    
    /**
     * Initialization hook method.
     * 
     * @return void
     */
    public function initialize() {
        parent::initialize();

        $this->response = $this->response->withType('application/json');
    }

}